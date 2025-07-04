#!/bin/bash

# サーバーワークス コーポレートサイト AWS移行スクリプト
# 使用方法: ./deploy-to-aws.sh [stack-name] [domain-name]

set -e

# 設定
STACK_NAME=${1:-"serverworks-corporate-site"}
DOMAIN_NAME=${2:-"serverworks-demo.example.com"}
REGION="ap-northeast-1"
GITHUB_OWNER="Morimasa-dev1"
GITHUB_REPO="gen-ai-project-repo"

echo "🚀 サーバーワークス コーポレートサイト AWS移行開始"
echo "=================================================="
echo "Stack Name: $STACK_NAME"
echo "Domain Name: $DOMAIN_NAME"
echo "Region: $REGION"
echo "=================================================="

# AWS CLI設定確認
echo "📋 AWS CLI設定確認中..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLIが設定されていません。aws configure を実行してください。"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ AWS Account ID: $ACCOUNT_ID"

# Phase 1: CloudFormationスタック作成
echo ""
echo "📦 Phase 1: CloudFormationスタック作成中..."
aws cloudformation create-stack \
    --stack-name "$STACK_NAME" \
    --template-body file://cloudformation-template.yaml \
    --parameters \
        ParameterKey=DomainName,ParameterValue="$DOMAIN_NAME" \
        ParameterKey=GitHubOwner,ParameterValue="$GITHUB_OWNER" \
        ParameterKey=GitHubRepo,ParameterValue="$GITHUB_REPO" \
    --capabilities CAPABILITY_IAM \
    --region "$REGION" \
    --tags \
        Key=Project,Value=ServerWorks-Corporate-Site \
        Key=Environment,Value=Production

echo "⏳ スタック作成完了を待機中..."
aws cloudformation wait stack-create-complete \
    --stack-name "$STACK_NAME" \
    --region "$REGION"

if [ $? -eq 0 ]; then
    echo "✅ CloudFormationスタック作成完了"
else
    echo "❌ CloudFormationスタック作成失敗"
    exit 1
fi

# スタック出力取得
echo ""
echo "📊 スタック出力情報取得中..."
WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
    --output text)

S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text)

CLOUDFRONT_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

echo "✅ Website URL: $WEBSITE_URL"
echo "✅ S3 Bucket: $S3_BUCKET"
echo "✅ CloudFront Distribution ID: $CLOUDFRONT_ID"

# Phase 2: 初回デプロイ
echo ""
echo "🚀 Phase 2: 初回デプロイ実行中..."

# TypeScriptコンパイル
echo "🔨 TypeScriptコンパイル中..."
if command -v tsc &> /dev/null; then
    tsc
    echo "✅ TypeScriptコンパイル完了"
else
    echo "⚠️  TypeScriptコンパイラが見つかりません。npx tsc を使用します..."
    npx tsc
fi

# S3にファイルアップロード
echo "📤 S3にファイルアップロード中..."
aws s3 sync . "s3://$S3_BUCKET" \
    --region "$REGION" \
    --delete \
    --exclude ".git/*" \
    --exclude "*.md" \
    --exclude "課題表.md" \
    --exclude "*.yaml" \
    --exclude "*.sh" \
    --exclude "buildspec.yml"

if [ $? -eq 0 ]; then
    echo "✅ S3アップロード完了"
else
    echo "❌ S3アップロード失敗"
    exit 1
fi

# CloudFrontキャッシュ無効化
echo "🔄 CloudFrontキャッシュ無効化中..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo "✅ キャッシュ無効化開始 (ID: $INVALIDATION_ID)"

# Phase 3: 動作確認
echo ""
echo "🔍 Phase 3: 動作確認中..."
echo "⏳ CloudFrontの配信開始を待機中（最大15分）..."

# 簡単な動作確認
sleep 30
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ サイトが正常に動作しています"
else
    echo "⚠️  サイトの動作確認でエラーが発生しました (HTTP: $HTTP_STATUS)"
    echo "   CloudFrontの配信が完了するまで時間がかかる場合があります"
fi

# Phase 4: 結果レポート
echo ""
echo "📋 移行完了レポート"
echo "=================================================="
echo "✅ CloudFormationスタック: $STACK_NAME"
echo "✅ ウェブサイトURL: $WEBSITE_URL"
echo "✅ S3バケット: $S3_BUCKET"
echo "✅ CloudFront Distribution: $CLOUDFRONT_ID"
echo ""
echo "🔧 次のステップ:"
echo "1. DNS設定: $DOMAIN_NAME を $WEBSITE_URL にCNAME設定"
echo "2. SSL証明書: Certificate Managerで証明書を取得・設定"
echo "3. CI/CD: CodePipelineでGitHub連携を設定"
echo "4. 監視: CloudWatchアラームの通知先を設定"
echo ""
echo "📊 推定月額コスト: $13.75 USD"
echo "=================================================="

# 設定ファイル出力
cat > aws-deployment-info.json << EOF
{
  "stackName": "$STACK_NAME",
  "region": "$REGION",
  "websiteUrl": "$WEBSITE_URL",
  "s3Bucket": "$S3_BUCKET",
  "cloudFrontDistributionId": "$CLOUDFRONT_ID",
  "domainName": "$DOMAIN_NAME",
  "deploymentDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "accountId": "$ACCOUNT_ID"
}
EOF

echo "💾 デプロイ情報を aws-deployment-info.json に保存しました"
echo ""
echo "🎉 AWS移行が完了しました！"
echo "   ウェブサイトにアクセス: $WEBSITE_URL"

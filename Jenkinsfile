
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
        skipDefaultCheckout(true)
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['DEV', 'QA', 'UAT', 'PROD'],
            description: 'Select deployment environment'
        )

        string(
            name: 'GIT_BRANCH',
            defaultValue: 'develop',
            description: 'Git branch to deploy'
        )
    }

    environment {
        AWS_DEFAULT_REGION = 'ap-south-1'

        REPO_URL = 'https://github.com/avi-devopshub/project-frontend.git'
        GITHUB_CREDENTIALS = 'github-token'

        NONPROD_BUCKET = 'avidevops-medical-erp-frontend-nonprod'
        PROD_BUCKET = 'avidevops-medical-erp-frontend-prod'

        NONPROD_CF_ID = 'E3MBY0W607M6DU'
        PROD_CF_ID = 'E3MBY0W607M6DU'
    }

    stages {

        // 1. Validate environment and branch

        stage('Validate Parameters') {
            steps {
                script {
                    def envName = params.ENVIRONMENT
                    def branch = params.GIT_BRANCH

                    if (envName == 'DEV' && branch != 'develop') {
                        error('DEV deployment requires develop branch')
                    }

                    if (envName == 'PROD' && branch != 'main') {
                        error('PROD deployment requires main branch')
                    }

                    if (['QA', 'UAT'].contains(envName) &&
                        !(branch ==~ /release\/.+/)) {
                        error('QA/UAT deployment requires release/* branch')
                    }

                    echo "Environment: ${envName}"
                    echo "Git Branch: ${branch}"
                }
            }
        }

        // 2. Checkout selected branch

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${params.GIT_BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${REPO_URL}",
                        credentialsId: "${GITHUB_CREDENTIALS}"
                    ]]
                ])
            }
        }

        // 3. Install dependencies

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        // 4. Build application

        stage('Build React Application') {
            steps {
                script {
                    def apiUrls = [
                        DEV : 'https://api.dev.avidevops.fun',
                        QA  : 'https://api.qa.avidevops.fun',
                        UAT : 'https://api.uat.avidevops.fun',
                        PROD: 'https://api.avidevops.fun'
                    ]

                    withEnv([
                        "VITE_ENV=${params.ENVIRONMENT}",
                        "VITE_API_BASE_URL=${apiUrls[params.ENVIRONMENT]}"
                    ]) {
                        sh 'npm run build'
                    }
                }

                sh 'test -f dist/index.html'
            }
        }

        // 5. DEV deployment

        stage('DEV Deployment') {
            when {
                expression { params.ENVIRONMENT == 'DEV' }
            }

            steps {
                echo 'Deploying frontend to DEV'

                sh '''
                    aws s3 sync dist/ \
                    s3://${NONPROD_BUCKET}/dev/ \
                    --delete
                '''
            }
        }

        stage('DEV CloudFront Invalidation') {
            when {
                expression { params.ENVIRONMENT == 'DEV' }
            }

            steps {
                sh '''
                    aws cloudfront create-invalidation \
                    --distribution-id ${NONPROD_CF_ID} \
                    --paths "/dev/*"
                '''
            }
        }

        // 6. QA deployment

        stage('QA Deployment') {
            when {
                expression { params.ENVIRONMENT == 'QA' }
            }

            steps {
                echo 'Deploying frontend to QA'

                sh '''
                    aws s3 sync dist/ \
                    s3://${NONPROD_BUCKET}/qa/ \
                    --delete
                '''
            }
        }

        stage('QA CloudFront Invalidation') {
            when {
                expression { params.ENVIRONMENT == 'QA' }
            }

            steps {
                sh '''
                    aws cloudfront create-invalidation \
                    --distribution-id ${NONPROD_CF_ID} \
                    --paths "/qa/*"
                '''
            }
        }

        // 7. UAT approval and deployment

        stage('UAT Approval') {
            when {
                expression { params.ENVIRONMENT == 'UAT' }
            }

            steps {
                input message: 'Approve deployment to UAT?',
                      ok: 'Approve UAT'
            }
        }

        stage('UAT Deployment') {
            when {
                expression { params.ENVIRONMENT == 'UAT' }
            }

            steps {
                echo 'Deploying frontend to UAT'

                sh '''
                    aws s3 sync dist/ \
                    s3://${NONPROD_BUCKET}/uat/ \
                    --delete
                '''
            }
        }

        stage('UAT CloudFront Invalidation') {
            when {
                expression { params.ENVIRONMENT == 'UAT' }
            }

            steps {
                sh '''
                    aws cloudfront create-invalidation \
                    --distribution-id ${NONPROD_CF_ID} \
                    --paths "/uat/*"
                '''
            }
        }

        // 8. PROD approval and deployment

        stage('PROD Approval') {
            when {
                expression { params.ENVIRONMENT == 'PROD' }
            }

            steps {
                input message: 'Approve PRODUCTION deployment?',
                      ok: 'Approve PROD'
            }
        }

        stage('PROD Deployment') {
            when {
                expression { params.ENVIRONMENT == 'PROD' }
            }

            steps {
                echo 'Deploying frontend to PRODUCTION'

                sh '''
                    aws s3 sync dist/ \
                    s3://${PROD_BUCKET}/ \
                    --delete
                '''
            }
        }

        stage('PROD CloudFront Invalidation') {
            when {
                expression { params.ENVIRONMENT == 'PROD' }
            }

            steps {
                sh '''
                    aws cloudfront create-invalidation \
                    --distribution-id ${PROD_CF_ID} \
                    --paths "/*"
                '''
            }
        }
    }

    post {
        success {
            echo "${params.ENVIRONMENT} deployment completed successfully!"
        }

        failure {
            echo 'Deployment failed. Check Jenkins Console Output.'
        }
    }
}

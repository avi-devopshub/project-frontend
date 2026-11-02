pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
                sh 'test -f dist/index.html'
            }
        }
    }

    post {
        success {
            echo 'Frontend build completed successfully.'
        }
        failure {
            echo 'Frontend pipeline failed. Check the stage logs.'
        }
    }
}

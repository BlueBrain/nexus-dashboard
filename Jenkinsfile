String version = env.BRANCH_NAME
String commitId = env.GIT_COMMIT
Boolean isRelease = version ==~ /v\d+\.\d+\.\d+.*/
Boolean isPR = env.CHANGE_ID != null
Boolean isMaster = version == 'master'

pipeline {
    agent any

    environment {
        imageStream = 'nexus-landing-page'
        imageBuildName = 'landing-page-build'
    }

    stages {
        stage('Start Pipeline') {
            steps{
                sh 'echo "Pipeline starting with environment:"'
                sh 'printenv'
            }
        }

        stage('Checkout and Install dependencies') {
            when {
                expression { !isRelease }
            }
            steps {
                checkout scm
                sh 'npm ci'
            }
        }

        stage('Review') {
            when {
                expression { !isRelease }
            }
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Test') {
                    steps {
                        sh 'npm run test'
                    }
                }
            }
        }

        stage('Build Image') {
            when {
                expression { isMaster && !isRelease && !isPR }
            }
            steps {
                sh 'npm run build'
                sh 'mkdir deployment && mv dist deployment && mv docker deployment'
                sh "oc start-build ${imageBuildName} --from-dir=deployment --follow"
            }
        }

        stage('Promote to staging') {
            when {
                expression { isMaster && !isRelease && !isPR }
            }
            steps {
                openshiftTag srcStream: imageStream, srcTag: 'latest', destStream: imageStream, destTag: "staging,${GIT_COMMIT.substring(0,7)}", verbose: 'false'
            }
        }

        stage('Promote to production') {
            when {
                expression { isRelease }
            }
            steps {
                openshiftTag srcStream: imageStream, srcTag: 'staging', destStream: imageStream, destTag: "production,${BRANCH_NAME.substring(1)}", verbose: 'false'
            }
        }
    }
}
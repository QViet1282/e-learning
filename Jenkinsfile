pipeline {
    agent { label 'server' }
    // triggers {
    //     githubPush() 
    // }
    environment {
        APP_DIR = '/var/jenkins/workspace/deploy'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/Viet']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
                    submoduleCfg: [],
                    userRemoteConfigs: [[url: 'https://github.com/QViet1282/e-learning']]
                ])
            }
        }
        stage('Install Dependencies') {
            steps {
                dir("${APP_DIR}/server") {
                    script {
                        try {
                            sh 'sudo yarn install'
                        } catch (Exception e) {
                            echo 'yarn install failed, cleaning up...'
                            sh 'sudo rm -rf node_modules yarn.lock'
                            sh 'sudo yarn install'
                        }
                    }
                }
                
            }
        }
        stage('Deploy') {
            steps {
                dir('/var/jenkins/workspace/deploy/server') {
                        sh 'pm2 delete all || true' 
                        sh 'pm2 start ecosystem.config.js --env production' 
                        sh 'pm2 save' 
                    }
            }
        } 
    }
}
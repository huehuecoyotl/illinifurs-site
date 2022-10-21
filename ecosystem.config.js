module.exports = {
  apps: [{
    name: 'illinifurs-site',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'illapp',
      host: ['illinifurs.com'],
      key: '~/.ssh/IlliniFurs-AWS.pem',
      ref: 'origin/main',
      repo: 'git@github.com:huehuecoyotl/illinifurs-site',
      path: '/apps/site',
      'post-deploy': './post_deploy.sh'
    }
  }
}

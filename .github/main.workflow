workflow "Deploy" {
  on = "push"
  resolves = [
    "Release",
    "Pages",
  ]
}

action "Master" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Pages" {
  needs = "Master"
  uses = "satya164/node-app-tasks@master"
  secrets = ["GITHUB_TOKEN"]
  args = "gh-pages"
}

action "Release" {
  needs = "Pages"
  uses = "satya164/node-app-tasks@master"
  secrets = ["NPM_AUTH_TOKEN", "GITHUB_TOKEN"]
  args = "release-it --non-interactive"
}

workflow "Build and Publish" {
  resolves = ["Publish"]
  on = "push"
}

action "Install Dependencies" {
  uses = "actions/npm@master"
  args = "install"
}

action "Build" {
  uses = "actions/npm@master"
  args = ""
}

# Filter for a new tag
action "Tag" {
  needs = "Build"
  uses = "actions/bin/filter@master"
  args = "tag"
}

action "Publish" {
  needs = "Tag"
  uses = "actions/npm@master"
  args = "publish"
  secrets = ["NPM_AUTH_TOKEN"]
}

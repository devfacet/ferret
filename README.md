## Ferret

[![Build Status][travis-image]][travis-url] [![GoDoc][godoc-image]][godoc-url] [![Release][release-image]][release-url]

Ferret is a search engine that unifies search results from different resources
such as Github, Slack, Trello, AnswerHub and Consul.

Distributed knowledge and avoiding context switching are very important for
efficiency. Ferret provides a unified search interface for retrieving and
accessing to information with minimal effort.

## IT'S STILL UNDER DEVELOPMENT


### Installation

| OSX | Linux | Win |
|:---:|:---:|:---:|
| [64bit][download-darwin-amd64-url] | [64bit][download-linux-amd64-url] | [64bit][download-windows-amd64-url] |

[See](#building-from-source) for building from source.


### Usage

Make sure Ferret is [configured](#configuration) properly before use it.
Also put `ferret` binary file to a path (i.e. `/usr/local/bin`) that can be
accessible from anywhere in the command line.

#### Help

```bash
ferret -h
```

#### Search

```bash
# Search Github
# For more Github search syntax see https://developer.github.com/v3/search/
ferret search github intent
ferret search github intent+extension:md

# Search Slack
ferret search slack "meeting minutes"

# Search Trello
ferret search trello milestone

# Search AnswerHub
ferret search answerhub vpn

# Search Consul
ferret search consul influxdb

# Pagination
# Number of search result for per page is 10
ferret search trello milestone --page 2

# Opening search results
# Search for 'milestone' keyword on Trello and go to the second search result
ferret search trello milestone
ferret search trello milestone --goto 2
```


### Configuration

Add the following environment variable definitions in `~/.bash_profile`
(OSX and Linux) file. Replace `export` command with `set` for Windows.

#### Global Configuration

```bash
# The command is used by `--goto` argument for opening links.
# It's optional and the default value is `open`
export FERRET_GOTO_CMD=open
```

#### Configurations for Providers

Each search provider needs set of environment variables for operating. You can 
define environment variables for one or more search provider.

```bash
# Github
export FERRET_GITHUB_URL=https://api.github.com/
# For a token see https://help.github.com/articles/creating-an-access-token-for-command-line-use/
export FERRET_GITHUB_TOKEN=
# It's optional for filtering specific Github user (i.e. yieldbot)
export FERRET_GITHUB_SEARCH_USER=


# Slack
# For a token see https://api.slack.com/docs/oauth-test-tokens
export FERRET_SLACK_TOKEN=


# Trello
# For a key see https://trello.com/app-key and visit (after update it);
# https://trello.com/1/authorize?key=REPLACEWITHYOURKEY&expiration=never&name=SinglePurposeToken&response_type=token&scope=read
export FERRET_TRELLO_KEY=
export FERRET_TRELLO_TOKEN=


# AnswerHub
# For enabling the REST API 
# see http://docs.answerhub.com/articles/1444/how-to-enable-and-grant-use-of-the-rest-api.html
export FERRET_ANSWERHUB_URL=https://answerhub.yourdomain.com
# For username and password information
# see 'My Preferences->Authentication Modes' page in your AnswerHub site
export FERRET_ANSWERHUB_USERNAME=
export FERRET_ANSWERHUB_PASSWORD=


# Consul
export FERRET_CONSUL_URL=http://consul.service.consul
```


### Building from source

```
go get -u -v github.com/yieldbot/ferret
cd $GOPATH/src/github.com/yieldbot/ferret
go build
```


### License

Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE.txt file.


[travis-url]: https://travis-ci.org/yieldbot/ferret
[travis-image]: https://travis-ci.org/yieldbot/ferret.svg?branch=master

[godoc-url]: https://godoc.org/github.com/yieldbot/ferret
[godoc-image]: https://godoc.org/github.com/yieldbot/ferret?status.svg

[release-url]: https://github.com/yieldbot/ferret/releases/latest
[release-image]: https://img.shields.io/badge/release-1.2.0-blue.svg

[download-darwin-amd64-url]: https://github.com/yieldbot/ferret/releases/download/v1.2.0/ferret-darwin-amd64.zip
[download-linux-amd64-url]: https://github.com/yieldbot/ferret/releases/download/v1.2.0/ferret-linux-amd64.zip
[download-windows-amd64-url]: https://github.com/yieldbot/ferret/releases/download/v1.2.0/ferret-windows-amd64.zip
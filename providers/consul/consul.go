/*
 * Ferret
 * Copyright (c) 2016 Yieldbot, Inc.
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

// Package consul implements Consul provider
package consul

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strings"

	"golang.org/x/net/context"
	"golang.org/x/net/context/ctxhttp"
)

// Provider represents the provider
type Provider struct {
	name  string
	title string
	url   string
}

// Register registers the provider
func Register(f func(provider interface{}) error) {
	// Init the provider
	var p = Provider{
		name:  "consul",
		title: "Consul",
		url:   strings.TrimSuffix(os.Getenv("FERRET_CONSUL_URL"), "/"),
	}

	// Register the provider
	if err := f(&p); err != nil {
		panic(err)
	}
}

// Info returns information
func (provider *Provider) Info() map[string]interface{} {
	return map[string]interface{}{
		"name":  provider.name,
		"title": provider.title,
	}
}

// SearchResult represent the structure of the search result
type SearchResult map[string][]string

// Search makes a search
func (provider *Provider) Search(ctx context.Context, args map[string]interface{}) ([]map[string]interface{}, error) {

	results := []map[string]interface{}{}
	page, ok := args["page"].(int)
	if page < 1 || !ok {
		page = 1
	}
	keyword, ok := args["keyword"].(string)

	dcs, err := provider.datacenter()
	if err != nil {
		return nil, errors.New("failed to fetch data. Error: " + err.Error())
	}
	for _, dc := range dcs {

		var u = fmt.Sprintf("%s/v1/catalog/services?dc=%s", provider.url, url.QueryEscape(dc))
		req, err := http.NewRequest("GET", u, nil)
		if err != nil {
			return nil, errors.New("failed to prepare request. Error: " + err.Error())
		}

		res, err := ctxhttp.Do(ctx, nil, req)
		if err != nil {
			return nil, errors.New("failed to fetch data. Error: " + err.Error())
		} else if res.StatusCode < 200 || res.StatusCode > 299 {
			return nil, errors.New("bad response: " + fmt.Sprintf("%d", res.StatusCode))
		}
		defer res.Body.Close()
		data, err := ioutil.ReadAll(res.Body)
		if err != nil {
			return nil, err
		}
		var sr SearchResult
		if err = json.Unmarshal(data, &sr); err != nil {
			return nil, errors.New("failed to unmarshal JSON data. Error: " + err.Error())
		}
		for k, v := range sr {
			if len(v) > 0 {
				for _, vv := range v {
					if strings.Contains(vv, keyword) || strings.Contains(k, keyword) {
						ri := map[string]interface{}{
							"Link":  fmt.Sprintf("%s/ui/#/%s/services/%s", provider.url, dc, k),
							"Title": fmt.Sprintf("%s.%s.service.%s.consul", vv, k, dc),
						}
						results = append(results, ri)
					}
				}
			} else {
				if strings.Contains(k, keyword) {
					ri := map[string]interface{}{
						"Link":  fmt.Sprintf("%s/ui/#/%s/services/%s", provider.url, dc, k),
						"Title": fmt.Sprintf("%s.service.%s.consul", k, dc),
					}
					results = append(results, ri)
				}
			}
		}

		if err != nil {
			return nil, err
		}
	}

	if len(results) > 0 {
		// TODO: implement sort
		var l, h = 0, 10
		if page > 1 {
			h = (page * 10)
			l = h - 10
		}
		if h > len(results) {
			h = len(results)
		}
		results = results[l:h]
	}

	return results, err
}

// datacenter gets the list of the datacenters
func (provider *Provider) datacenter() ([]string, error) {

	// Prepare the request
	query := fmt.Sprintf("%s/v1/catalog/datacenters", provider.url)
	req, err := http.NewRequest("GET", query, nil)

	// Make the request
	var client = &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, errors.New("failed to fetch data. Error: " + err.Error())
	} else if res.StatusCode < 200 || res.StatusCode > 299 {
		return nil, errors.New("bad response: " + fmt.Sprintf("%d", res.StatusCode))
	}
	defer res.Body.Close()
	data, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	// Parse and prepare the result
	var result []string
	if err = json.Unmarshal(data, &result); err != nil {
		return nil, errors.New("failed to unmarshal JSON data. Error: " + err.Error())
	}

	return result, nil
}

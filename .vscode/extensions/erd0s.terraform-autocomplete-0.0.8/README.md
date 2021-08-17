# Terraform Autocomplete

WARNING! This is very beta, things might not work as expected so don't rely solely on this extension as a complete reference to terraform parameters and exported arguments. PRs welcome!

This extension provides basic autocomplete on AWS resources. Scraping functionality can be found at https://github.com/erd0s/terraform-scrape.

## Requirements

Doesn't include any highlighting functionality or linting, will go well with [Mikael Olenfalk's Terraform extension](https://github.com/mauve/vscode-terraform) (but not required).

## What Works?
Hinting on aws resource types

![Hinting on aws resource types](https://github.com/erd0s/terraform-autocomplete/raw/master/docs/1.gif)

Hinting on resource arguments

![Hinting on resource arguments](https://github.com/erd0s/terraform-autocomplete/raw/master/docs/2.gif)

Hinting on variables `${<hints here>.<more hints>.<wow! hints!>}`

![Hinting on variables](https://github.com/erd0s/terraform-autocomplete/raw/master/docs/3.gif)

Go to definition for AWS resources

![Go to definition for AWS resources](https://github.com/erd0s/terraform-autocomplete/raw/master/docs/4.gif)

## What Doesn't Work?
* Any other providers than AWS (could be added easily by adding to the [aws-resources.ts](https://github.com/erd0s/terraform-autocomplete/blob/master/src/aws-resources.ts) file).
* Exporting attributes across files.
* Autocomplete on nested varibles, eg. `aws_s3_bucket_notification.somename.queue.<can't complete past here>`.

## Known Issues

I found that having the advanced terraform snippets extension enabled at the same time as this obscured the hints in some instances.

## Release Notes

See the [changelog](https://github.com/erd0s/terraform-autocomplete/blob/master/CHANGELOG.md) for more info.
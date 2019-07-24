# fastq.bio *(serverless version)*
*An interactive web tool that generates quality metrics from DNA sequencing data.*

**This version of fastq.bio runs the WebAssembly code in [Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/).**

See [this repo](https://github.com/robertaboukhalil/fastq.bio) for the version of fastq.bio that runs WebAssembly in the browser.

## Deploy

- To use it in your own workers, modify the `API_URL` variable in [worker.js](https://github.com/robertaboukhalil/fastq.bio-serverless/blob/master/app/worker.js#L1) to point to your own serverless function.
- Use the [Cloudflare wrangler](https://github.com/cloudflare/wrangler) tool to compile to WebAssembly and deploy to the cloud

## Architecture

- User provides a File from their local filesystem
- File transfered to WebWorker (so can parse file synchronously)
- Parse random chunks of the file
- Make multiple parallel API calls to the Cloudflare workers on chunks of data
- Data analysis runs in Cloudflare Workers (code compiled from Rust --> WebAssembly)

## Details
An article with more details is coming soon

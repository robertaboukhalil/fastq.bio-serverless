addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request)
{
  // Expecting a POST request
  if(request.method != "POST") {
    return new Response(`Error: expecting a POST request, not a '${request.method}' request`);
  }

  const { fastq_metrics } = wasm_bindgen;
  await wasm_bindgen(wasm)

  // Fetch metrics
  try {
    const postData = await request.formData();
    const stats = fastq_metrics(postData.get('sequence'));

    return new Response(stats, {
      status: 200,
      // Support CORS (https://developers.cloudflare.com/workers/recipes/cors-preflight-requests/)
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    })
  } catch (err) {
    return new Response('Error: could not generate metrics')
  }
}


// Content-Type: application/x-www-form-urlencoded
// Body:
// sequence=@ST-E00118:53:H02GVALXX:1:1101:5780:1555 1:N:0:0
// CAGACATGAATAATTCATCCATCCNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN
// +
// -A<FFJJFJJJJJJJJJJJJJJJJ###############################################################################################################################
// @ST-E00118:53:H02GVALXX:1:1101:5882:1555 1:N:0:0
// AGGGAGCGTTTCCTGCTGTAGCCTNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN
// +
// AAFAFF7FJFAJFJJJJJJJJJJJ###############################################################################################################################
// @ST-E00118:53:H02GVALXX:1:1101:5983:1555 1:N:0:0
// TTACCTCATGAGTTTCCCTTATCTNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN
// +
// AA-FFJJ<AJAAFJJJJJJJFJAF###############################################################################################################################

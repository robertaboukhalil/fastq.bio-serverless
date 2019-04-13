addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request)
{
  const { fastq_metrics } = wasm_bindgen;
  await wasm_bindgen(wasm)

  try {
    const postData = await request.formData();
    const fastq = postData.get('sequence');
    const stats = fastq_metrics(fastq);

    return new Response(stats, {status: 200})
  
  } catch (err) {
    return new Response('could not unbundle post data')
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

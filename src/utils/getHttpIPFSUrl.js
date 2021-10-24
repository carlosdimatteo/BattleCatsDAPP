export function getHTTPIPFSURL(ipfsURL){
  const id = ipfsURL.replace('ipfs://','')
  
  return `https://cloudflare-ipfs.com/ipfs/${id}` 
  } 
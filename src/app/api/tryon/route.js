import { NextResponse } from 'next/server';
import { Client, handle_file } from '@gradio/client';

export async function POST(req) {
  let clothUrl = null;
  try {
    const formData = await req.formData();
    const personImage = formData.get('personImage');
    clothUrl = formData.get('clothUrl');

    if (!personImage || !clothUrl) {
      return NextResponse.json({ error: 'Missing personImage or clothUrl' }, { status: 400 });
    }

    // Diagnostic token check
    const tokenExists = !!process.env.HF_TOKEN;
    const tokenIsValid = tokenExists && !process.env.HF_TOKEN.includes('your_copied');
    console.log(`[HF API Try-On Attempt] Token Loaded: ${tokenExists}, Valid Secret: ${tokenIsValid}`);

    // Connect to the public CatVTON Space (pass HF_TOKEN to increase free quota if set)
    const client = await Client.connect("zhengchong/CatVTON", {
      hf_token: tokenIsValid ? process.env.HF_TOKEN : undefined
    });

    // Convert incoming file stream to a Blob that the Gradio Client accepts
    const arrayBuffer = await personImage.arrayBuffer();
    const fileBlob = new Blob([arrayBuffer], { type: personImage.type });

    // Create a dummy 1x1 black PNG mask layer to avoid IndexError and trigger the server's automasker
    const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const maskBuffer = Buffer.from(dummyPngBase64, 'base64');
    const maskBlob = new Blob([maskBuffer], { type: 'image/png' });

    // Call prediction using index arrays
    const result = await client.predict("submit_function", [
      {
        background: handle_file(fileBlob),
        layers: [
          handle_file(maskBlob)
        ],
        composite: null
      },
      handle_file(clothUrl),
      "overall",    // Try-On Cloth Type
      40,           // steps
      2.5,          // CFG Strength
      42,           // Seed
      "result only" // Show Type
    ]);

    if (result.data && result.data[0]) {
      const outputImageUrl = result.data[0].url || result.data[0];
      return NextResponse.json({ success: true, image: outputImageUrl });
    } else {
      throw new Error('Hugging Face response did not contain an output image');
    }
  } catch (err) {
    console.error('Server API Try-On error:', err);
    
    // Allow manual mock simulation if explicitly configured in environment variables
    if (process.env.MOCK_TRYON === 'true') {
      console.log('[MOCK TRYON ACTIVE] Returning clothUrl as mock result.');
      return NextResponse.json({ 
        success: true, 
        image: clothUrl, 
        isMock: true, 
        message: 'Mock response due to MOCK_TRYON environment variable override.' 
      });
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

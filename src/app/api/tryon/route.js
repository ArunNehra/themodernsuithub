import { NextResponse } from 'next/server';
import { Client, handle_file } from '@gradio/client';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const personImage = formData.get('personImage');
    const clothUrl = formData.get('clothUrl');

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

    // Call prediction using index arrays
    const result = await client.predict("submit_function", [
      {
        background: handle_file(fileBlob),
        layers: [],
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// tests/transcription-connectivity.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// CONFIGURATION
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const USER_EMAIL = 'test@example.com'; // Use a valid test user
const USER_PASSWORD = 'password123';   // Use a valid test password
const CHILD_ID = 1;                    // ID of a child profile to test against

test.describe('Speechmatics Connectivity Check', () => {
  let authToken: string;

  // 1. Authenticate before running the test
  test.beforeAll(async ({ request }) => {
    // Login to get the access token
    const loginResponse = await request.post(`${API_URL}/auth/token`, {
      form: {
        username: USER_EMAIL,
        password: USER_PASSWORD,
      },
    });

    expect(loginResponse.ok(), 'Login failed - check credentials').toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.access_token;
  });

  test('should successfully upload and transcribe an audio file', async ({ request }) => {
    // 2. Prepare a small dummy .wav file for testing
    // This creates a minimal valid WAV header + 1 second of silence
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
      0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02, 0x00, 0x10, 0x00,
      0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00
    ]);
    const filePath = path.join(__dirname, 'test-audio.wav');
    fs.writeFileSync(filePath, wavHeader);

    // 3. Upload the Recording
    // Note: The backend requires the file field to be named 'file'
    // Reference: app/routers/recordings.py
    const uploadResponse = await request.post(`${API_URL}/recordings/`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        // Note: Playwright handles multipart/form-data boundary automatically when using multipart
      },
      multipart: {
        file: {
          name: 'test-audio.wav',
          mimeType: 'audio/wav',
          buffer: fs.readFileSync(filePath),
        },
      },
      // Pass the child_id via query param if required by your specific auth/dependency logic,
      // but based on your code, it seems inferred from the authorized user/context. 
      // If get_child_if_authorized relies on a query param or header, add it here.
      // Based on typical patterns in your app, you might need to ensure the user is 'authorized' for the child.
      // If the backend selects the child via a specific header or query param, ensure it's included.
      params: { child_id: CHILD_ID.toString() } 
    });

    expect(uploadResponse.ok(), `Upload failed: ${await uploadResponse.text()}`).toBeTruthy();
    const recordingData = await uploadResponse.json();
    const recordingId = recordingData.id;

    console.log(`Upload successful. Recording ID: ${recordingId}. Waiting for transcription...`);

    // 4. Poll for Completion (Simulating frontend waiting)
    // Speechmatics can take a few seconds. We'll poll for up to 30 seconds.
    let status = 'queued';
    let attempts = 0;
    const maxAttempts = 10;
    
    while (status !== 'ready' && status !== 'failed' && attempts < maxAttempts) {
      // Wait 3 seconds between checks
      await new Promise(res => setTimeout(res, 3000));
      
      const statusResponse = await request.get(`${API_URL}/recordings/by-id/${recordingId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      expect(statusResponse.ok()).toBeTruthy();
      const statusData = await statusResponse.json();
      status = statusData.status;
      attempts++;
      console.log(`Attempt ${attempts}: Status is '${status}'`);
    }

    // 5. Assertions
    expect(status).toBe('ready'); // "ready" implies Speechmatics returned success and analysis finished

    // Verify transcription exists in the response
    const finalResponse = await request.get(`${API_URL}/recordings/by-id/${recordingId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const finalData = await finalResponse.json();
    
    // Check if transcriptions array is populated (if your API returns it here)
    // or fetch the file explicitly
    const transcriptionFileResponse = await request.get(`${API_URL}/transcriptions/${recordingId}/file`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
    });

    expect(transcriptionFileResponse.ok(), 'Failed to fetch transcription text file').toBeTruthy();
    
    // Clean up: Delete the test recording
    await request.delete(`${API_URL}/recordings/${recordingId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
    });
    
    // Clean up: Delete local test file
    fs.unlinkSync(filePath);
  });
});
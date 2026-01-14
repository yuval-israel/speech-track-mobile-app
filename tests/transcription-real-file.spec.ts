// tests/transcription-real-file.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// CONFIGURATION
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
// Password must match backend strength requirements (if any)
const USER_PASSWORD = 'Password123!';
const REAL_FILE_PATH = 'C:\\Users\\yuval\\Downloads\\recording1.wav';

test.describe('Speechmatics Real File Connectivity Check', () => {
    let authToken: string;
    let childId: number;

    test.beforeAll(async ({ request }) => {
        // Generate a unique username (UserCreate max_length=30)
        const uniqueId = Date.now();
        // Use a shorter username than email to safely fit within 30 chars
        const TEST_USERNAME = `user_${uniqueId}`;
        console.log(`Using test user: ${TEST_USERNAME}`);

        // 1. Register
        const registerResponse = await request.post(`${API_URL}/users/`, {
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({
                username: TEST_USERNAME,
                password: USER_PASSWORD,
            }),
        });
        // 201 created, or 200 ok
        expect(registerResponse.ok(), `Registration failed: ${await registerResponse.text()}`).toBeTruthy();

        // 2. Login
        const loginResponse = await request.post(`${API_URL}/auth/token`, {
            form: {
                username: TEST_USERNAME,
                password: USER_PASSWORD,
            },
        });
        expect(loginResponse.ok(), `Login failed: ${await loginResponse.text()}`).toBeTruthy();
        const loginData = await loginResponse.json();
        authToken = loginData.access_token;

        // 3. Create Child
        const childResponse = await request.post(`${API_URL}/children/`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            data: {
                name: 'Test Child',
                birthdate: '2020-01-01',
                gender: 'male'
            }
        });
        expect(childResponse.ok(), `Child creation failed: ${await childResponse.text()}`).toBeTruthy();
        const childData = await childResponse.json();
        childId = childData.id;
        console.log(`Created child with ID: ${childId}`);
    });

    test('should successfully upload and transcribe the real audio file', async ({ request }) => {
        test.setTimeout(5 * 60 * 1000);

        if (!fs.existsSync(REAL_FILE_PATH)) {
            throw new Error(`Test file not found at: ${REAL_FILE_PATH}`);
        }

        console.log(`Reading file from: ${REAL_FILE_PATH}`);
        const fileBuffer = fs.readFileSync(REAL_FILE_PATH);
        const fileName = path.basename(REAL_FILE_PATH);

        // Upload
        console.log('Starting upload...');
        const uploadResponse = await request.post(`${API_URL}/recordings/`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            multipart: {
                file: {
                    name: fileName,
                    mimeType: 'audio/wav',
                    buffer: fileBuffer,
                },
            },
            params: { child_id: childId.toString() },
            timeout: 60000
        });

        expect(uploadResponse.ok(), `Upload failed: ${await uploadResponse.text()}`).toBeTruthy();
        const recordingData = await uploadResponse.json();
        const recordingId = recordingData.id;

        console.log(`Upload successful. Recording ID: ${recordingId}. Waiting for transcription...`);

        // Poll
        let status = 'queued';
        let attempts = 0;
        const maxAttempts = 60;

        while (status !== 'ready' && status !== 'failed' && attempts < maxAttempts) {
            await new Promise(res => setTimeout(res, 5000));
            const statusResponse = await request.get(`${API_URL}/recordings/by-id/${recordingId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            if (statusResponse.ok()) {
                const statusData = await statusResponse.json();
                status = statusData.status;
                console.log(`Attempt ${attempts + 1}/${maxAttempts}: Status is '${status}'`);
            }
            attempts++;
        }

        expect(status).toBe('ready');

        // Verify transcription
        const transcriptionFileResponse = await request.get(`${API_URL}/transcriptions/${recordingId}/file`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        expect(transcriptionFileResponse.ok(), 'Failed to fetch transcription text file').toBeTruthy();
        const transcriptionText = await transcriptionFileResponse.text();
        console.log('Transcription preview:', transcriptionText.substring(0, 100) + '...');

        // Cleanup
        await request.delete(`${API_URL}/recordings/${recordingId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
    });
});

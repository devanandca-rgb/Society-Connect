import { getAccessToken } from './auth';

export interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink?: string;
  mimeType?: string;
}

/**
 * Upload a text, JSON, or CSV file to Google Drive using Drive v3 API
 */
export async function uploadToDrive(
  fileName: string,
  content: string,
  mimeType: string = 'text/plain'
): Promise<DriveUploadResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not available. Please sign in with Google first.');
  }

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: 'Housing Society ERP Document - Greenwood Heights CHS',
  };

  const boundary = 'foo_bar_baz';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Drive upload failed with status ${response.status}`);
  }

  return await response.json();
}

/**
 * List files created or accessible by this app
 */
export async function listDriveFiles(): Promise<Array<{ id: string; name: string; webViewLink?: string; createdTime?: string }>> {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,webViewLink,createdTime,mimeType)&orderBy=createdTime desc',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.warn('Failed to fetch Drive files', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.files || [];
  } catch (err) {
    console.error('Error fetching drive files', err);
    return [];
  }
}

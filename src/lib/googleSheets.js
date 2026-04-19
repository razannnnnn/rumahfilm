import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function appendRequest({ nama, judul }) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const timestamp = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[timestamp, nama, judul, "Pending", ""]],
    },
  });
}

export async function getRequests() {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:E",
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: index + 2,
    timestamp: row[0] || "",
    nama: row[1] || "",
    judul: row[2] || "",
    status: row[3] || "Pending",
    catatan: row[4] || "",
  }));
}

export async function updateStatus(rowIndex, status, catatan = "") {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!D${rowIndex}:E${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[status, catatan]],
    },
  });
}
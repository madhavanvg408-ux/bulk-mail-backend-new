import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function App() {
  const [msg, setMsg] = useState("");
  const [emails, setEmails] = useState([]);
  const [status, setStatus] = useState(false);

  function handlemsg(e) {
    setMsg(e.target.value);
  }

  function handlefile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const result = XLSX.utils.sheet_to_json(worksheet, {
        header: "A",
      });

      const emailList = result
        .map(row => row.A)
        .filter(email => email && email.includes("@"));

      setEmails(emailList);

      console.log("Emails from Excel:", emailList);
    };

    reader.readAsBinaryString(file);
  }

  async function send() {
    if (!msg.trim()) {
      alert("Message is empty");
      return;
    }

    if (emails.length === 0) {
      alert("No emails uploaded");
      return;
    }

    try {
      setStatus(true);

const res = await axios.post(
  `${import.meta.env.VITE_BASE_URL}/sendemail`,
  {
    msg,
    emails,
  }
);

    if (res.data === true) {
      alert("Bulk Emails Sent Successfully ✅");
    } else {
      alert("Failed to send emails ❌");
    }
  } catch (error) {
    console.error(error);
    alert("Server error ❌");
  } finally {
    setStatus(false);
  }
}

return (
  <div className="min-h-screen bg-blue-300">
    <div className="bg-blue-950 text-white text-center">
      <h1 className="text-2xl font-medium px-5 py-3">
        Bulk Mail
      </h1>
    </div>

    <div className="bg-blue-800 text-white text-center">
      <h1 className="font-medium px-5 py-3">
        We can help your business with sending multiple emails at once
      </h1>
    </div>

    <div className="bg-blue-600 text-white text-center">
      <h1 className="font-medium px-5 py-3">
        Drag and Drop
      </h1>
    </div>

    <div className="bg-blue-400 flex flex-col items-center text-black px-5 py-6 gap-4">
      <textarea
        value={msg}
        onChange={handlemsg}
        className="w-[80%] h-32 py-2 px-2 outline-none border border-black rounded-md"
        placeholder="Enter the Email text..."
      />

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handlefile}
        className="border-4 border-dashed py-6 px-6"
      />

      <p className="font-medium">
        Total Emails in the file : {emails.length}
      </p>

      <button
        onClick={send}
        className="mt-2 bg-blue-950 py-2 px-6 text-white font-medium rounded-md"
      >
        {status ? "Sending..." : "Send"}
      </button>
    </div>

    <div className="bg-blue-200 text-center py-3">
      <p className="text-sm text-black">
        © Bulk Mail App
      </p>
    </div>
  </div>
);
}

export default App;

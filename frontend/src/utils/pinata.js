import axios from 'axios';

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxNmEwZmYyMC1lY2IyLTQ5NzItYTJiZi0xNWEyZTk2YzEzYWYiLCJlbWFpbCI6ImJhbHYyNzczNTNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ3MDJmM2YwNDdmZmVkNDUwNDI0Iiwic2NvcGVkS2V5U2VjcmV0IjoiZTFlNWU4NzcyN2NkMzUxZDgyOTk1MjY2ODg2NGRkOTMwMjQxMDE4Y2M0YjUyYTJjZGE1YTcyMDAwZDNkMzg2NCIsImV4cCI6MTc5NzIwOTkyN30.EbSmo9_Cv3XixIOTcbSQXEaOL7xX0Dob1jVnW41JYSE'; // Nên để trong file .env

// 1. Hàm upload ảnh lên IPFS
export const pinFileToIPFS = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
        name: `avatar_${file.name}`,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                'Authorization': `Bearer ${JWT}`,
                "Content-Type": "multipart/form-data"
            }
        });
        return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
        console.log(error);
        return null;
    }
};

// 2. Hàm upload JSON (Profile info) lên IPFS
export const pinJSONToIPFS = async (body) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    try {
        const res = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${JWT}`
            }
        });
        return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
        console.log(error);
        return null;
    }
};
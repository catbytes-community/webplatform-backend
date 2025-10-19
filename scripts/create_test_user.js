const axios = require('axios');

// 1. Update user's infomation in the script
// 2. After user is created, set a valid firebase_id in the database for the user

const BASE_URL = 'http://127.0.0.1:8080';

const userInfo = {
  email: 'alionacatbytes@gmail.com',
  name: 'Aliona CatBytes',
  about: 'I am a software engineer.',
  discord_nickname: 'CatBytes#1234',
  languages: ['English', 'Russian'],
};

async function main() {
  try {
    console.log('Creating application...');
    const applicationResponse = await axios.post(`${BASE_URL}/applications`, {
      email: userInfo.email,
      name: userInfo.name,
      about: userInfo.about,
      discord_nickname: userInfo.discord_nickname,
      video_link: 'http://example.com/video',
    });
    console.log('Application created:', applicationResponse.data[0]);

    const applicationId = applicationResponse.data[0].id;

    console.log('Approving application...');
    const approveResponse = await axios.put(
      `${BASE_URL}/applications/${applicationId}`,
      {
        status: 'approved',
      },
      {
        headers: {
          Cookie: 'userUID=some-valid-firebase-id', // Replace with a valid Firebase ID if needed
        },
      }
    );
    console.log('Application approved:', approveResponse.data);

    console.log('Creating user...');
    const userResponse = await axios.post(`${BASE_URL}/users`, {
      email: userInfo.email,
      name: userInfo.name,
      about: userInfo.about,
      languages: userInfo.languages,
      discord_nickname: userInfo.discord_nickname,
    });
    console.log('User created:', userResponse.data);
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

main();
import React, { useState, useEffect } from 'react';
import './App.css';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { gapi } from 'gapi-script';
import TableManagement from './components/tableControl';
import AddTransaction from './components/transactionControl'; // นำเข้า AddTransaction

function App() {
  //242314597514-jtuc1b4jsqgs6cfk1un37un02beegv8e.apps.googleusercontent.com
  const clientId = "242314597514-jtuc1b4jsqgs6cfk1un37un02beegv8e.apps.googleusercontent.com";
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [tables, setTables] = useState([]); // เก็บตารางที่ดึงจาก backend

  const handleLoginSuccess = (res) => {
    const profile = res.profileObj;
    setProfile({
      name: profile.name,
      email: profile.email,
      imageUrl: profile.imageUrl,
    });

    sendProfileToServer(profile);
  };

  const onFailure = (res) => {
    console.error('Failed to sign in', res);
  };

  const sendProfileToServer = async (profile) => {
    try {
      const response = await fetch("http://localhost:3030/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          image: profile.imageUrl,
        }),
      });

      const data = await response.json();
      setUser(data.user); // เก็บข้อมูลผู้ใช้ที่ได้รับจาก server

      // หลังจากล็อกอินสำเร็จ ให้ดึงตารางจาก backend
      fetchTables(data.user.id);
    } catch (error) {
      console.error("Error sending data to server:", error);
    }
  };

  const fetchTables = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3030/api/gettables?userId=${userId}`);
      const data = await response.json();
      setTables(data); // เก็บข้อมูล tables ที่ดึงได้ใน state
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const logOut = () => {
    setProfile(null);
    setUser(null);
    setTables([]); // เคลียร์ tables หลังออกจากระบบ
  };

  useEffect(() => {
    const initClient = () => {
      gapi.load('client:auth2', () => {
        gapi.client.init({
          clientId: clientId,
          scope: ''
        })
          .then(() => {
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance.isSignedIn.get()) {
              const user = authInstance.currentUser.get();
              const userProfile = user.getBasicProfile();
              setProfile({
                name: userProfile.getName(),
                email: userProfile.getEmail(),
                imageUrl: userProfile.getImageUrl()
              });
            }
          })
          .catch((error) => {
            console.error('Error initializing GAPI', error);
          });
      });
    };

    initClient();
  }, []);

  return (
    <div className="App">
      {user ? (
        <div>
          <img src={profile.imageUrl} alt={profile.name} />
          <h3>User Logged in</h3>
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
          <br />
          <GoogleLogout
            clientId={clientId}
            buttonText="Logout"
            onLogoutSuccess={logOut}
          />
          <div>
            <h1>Welcome, {user.name}</h1>
            <TableManagement userId={user.id} /> {/* ส่ง userId ไปยัง TableManagement */}
            <AddTransaction userId={user.id} tables={tables} /> {/* เพิ่ม AddTransaction component */}
          </div>
        </div>
      ) : (
        <GoogleLogin
          clientId={clientId}
          buttonText="Sign in with Google"
          onSuccess={handleLoginSuccess}
          onFailure={onFailure}
          cookiePolicy={"single_host_origin"}
          isSignedIn={true}
        />
      )}
    </div>
  );
}

export default App;

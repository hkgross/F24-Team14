// Sponsors.js
import React, { useDebugValue, useState, useEffect} from 'react';
import useDjangoData from '../hooks/useDjangoData';
import { useAuth, refreshAccessToken, fetchAccSponsorInfo} from "../hooks/AuthProvider";

const SponsorsContent = () => {
  const {data: sponsors, loading, error} = useDjangoData('api/sponsors/');
  const { user, fetchUserInfo, refreshAccessToken, fetchAccSponsorInfo} = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading2, setLoading2] = useState(true);
  const [accSponsorData, setAccSponsorData] = useState(null);
  const [loading3, setLoading3] = useState(true);


  useEffect(() => {
    const getUserData = async () => {
        try {
            setLoading2(true);

            // Refresh in case
            await refreshAccessToken();

            const data = await fetchAccSponsorInfo();
            if (data) {
                setAccSponsorData(data);
                // REMOVE LATER
                // Check if data received
                // console.log("data: ", data);
            }
        }
        catch (error) {
            console.error("Error", error);
        } 
        finally {
            setLoading2(false);
        }
    };

    getUserData();

}, []);

useEffect(() => {
  const getUserData = async () => {
      try {
          setLoading3(true);

          // Refresh in case
          await refreshAccessToken();

          const data = await fetchUserInfo();
          if (data) {
              setUserData(data);
              // REMOVE LATER
              // Check if data received
              // console.log("data: ", data);
          }
      }
      catch (error) {
          console.error("Error", error);
      } 
      finally {
          setLoading3(false);
      }
  };

  getUserData();

}, []);

  if (loading) return (<h1>Loading</h1>);
  if (error) return console.error(error.message);
  if (!sponsors) return console.log("no data");
  let accSponsorDict = {};
  if(accSponsorData) {
    for (let i = 0; i < accSponsorData.length; i++) {
      accSponsorDict[accSponsorData[i].SPONSOR_ID] = accSponsorData[i]
    }
  };
  //html sucks!
  const listItems = sponsors.map(sponsor => 
    <li>
      <div class="card_sponsor">
        <div class="container">
          <div class='flexbox-container-sponsor'>
            <div>
              <h4><b>{sponsor.NAME}</b></h4>
              <p>{sponsor.DESCRIPTION}</p>
            </div>
            <div>
              
                {userData && userData.account_type_display == 'Driver' ? 
                accSponsorDict[sponsor.SPONSOR_ID] && accSponsorDict[sponsor.SPONSOR_ID].STATUS === 'accepted' ? 
                <button type="button" class="sponsor-button" style={{pointerEvents: 'none',backgroundColor:'navy'}}>App Accepted</button>:
                accSponsorDict[sponsor.SPONSOR_ID] && accSponsorDict[sponsor.SPONSOR_ID].STATUS === 'open' ?
                <button type="button" class="sponsor-button" style={{pointerEvents: 'none',backgroundColor:'navy'}}>Application Already Open</button>:
                accSponsorDict[sponsor.SPONSOR_ID] && accSponsorDict[sponsor.SPONSOR_ID].STATUS === 'rejected' ?
                <button type="button" class="sponsor-button" style={{pointerEvents: 'none',backgroundColor:'navy'}}>You've Been Rejected</button>:
                accSponsorDict[sponsor.SPONSOR_ID] && accSponsorDict[sponsor.SPONSOR_ID].STATUS === '' ?
                <button type="button" class="sponsor-button" style={{pointerEvents: 'none',backgroundColor:'navy'}}>Contact an Admin</button>:
                <a href={"/applications/" + sponsor.SPONSOR_ID}>
                <button type="button" class="sponsor-button">Apply Now!</button>
                </a>:
                (user && user.type == 'Sponsor')  || (user && user.type =='Admin')?<div></div> :<div></div>} 
                {console.log(userData)}
                {console.log(accSponsorDict)}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
  return (
    <div>
      {listItems}
            
      </div>
  );
};

export default SponsorsContent;

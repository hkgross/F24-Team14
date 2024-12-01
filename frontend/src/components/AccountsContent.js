import React, { useDebugValue, useState } from 'react';
import useDjangoData from '../hooks/useDjangoData';

const AccountsContent = () => {
  const {data: accounts, loading, error} = useDjangoData('accounts/');

  if (loading) return console.log("loading...");
  if (error) return console.error(error.message);
  if (!accounts) return console.log("no data");

  //html sucks!
  const listItems = accounts.map(account => 
    <li>
      <div class="card_sponsor">
        <div class="container">
          <div class='flexbox-container-sponsor'>
            <div>
              <h4><b>{account.NAME}</b></h4>
              <p>{account.BIO}</p>
            </div>
            <div>
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

export default AccountsContent;

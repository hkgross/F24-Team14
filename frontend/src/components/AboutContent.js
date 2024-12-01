import React, { useDebugValue, useState } from 'react';
import useDjangoData from '../hooks/useDjangoData';

const AboutContent = () => {
    // Use the useDjangoData hook to get data from 
    const {data: about, loading, error} = useDjangoData('about/about');

    // Check console for debugging
    if (loading) return console.log("loading...");
    if (error) return console.error(error.message);
    if (!about) return console.log("no data");


    return (
        <div>
            <div className="about-container">
                <h1 className="font-karla">About</h1>
                <div className="about-entry">
                    <h2 className="font-karla">Team: </h2> 
                    <p className="font-merriweather">{about[0].TEAM_NUM}</p>
                </div>
                <div className='about-entry'>
                    <h2 className="font-karla">Version: </h2>
                    <p className="font-merriweather">{about[0].VERSION_NUM}</p>
                </div>
                <div className='about-entry'>
                    <h2 className="font-karla">Release Date: </h2>
                    <p className="font-merriweather">{about[0].RELEASE_DATE}</p>
                </div>
                <div className='about-entry'>
                    <h2 className="font-karla">Product Name: </h2>
                    <p className="font-merriweather">{about[0].PRODUCT_NAME}</p>
                </div>
                <div className='about-entry'>
                    <h2 className="font-karla">Product Description: </h2>
                    <p className="font-merriweather">{about[0].ABOUT_DESC}</p>
                </div>
            </div>
        </div>
    )
}
export default AboutContent;


// Generic hook for getting data from Django

import { useState, useEffect } from 'react';
import axiosInstance from '../services/axios';

const useDjangoData = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
          try{
            const response = await axiosInstance.get(url);
            setData(response.data);
          }
          catch (err) {
            console.error(err);
            setError(err);
          }
          finally {
            setLoading(false);
          }
      };
      fetchData();
    }, [url]);

    return {data, loading, error};
};

export default useDjangoData;
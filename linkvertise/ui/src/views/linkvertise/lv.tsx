import React, { useEffect } from 'react';
import axios from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import {
    prefix
} from '@/components/routes';

export default () => {
    const navigate = useNavigate();
    useEffect(() => {
        const url = new URL(window.location.href);
        const link = url.searchParams.get('link');
        axios.get(`/linkvertise/lv?link=${link}`).then((res) => {
            console.log(res);
            navigate(prefix + '/')
        })
    }, [])
    return (
        <div>
            <div className="dashboard__loader">
                <div className="loader__circle"></div>
                <h2>Verifying...</h2>
            </div>
        </div>
    )
}
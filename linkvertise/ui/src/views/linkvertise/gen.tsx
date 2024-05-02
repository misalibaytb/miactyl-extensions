import React, { useEffect } from 'react';
import axios from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import {
    prefix
} from '@/components/routes';
import { toast } from 'react-toastify';

export default () => {
    useEffect(() => {
        axios.get(`/linkvertise/link`).then((res) => {
            if (!res.data.success) return toast.error('You have reached the limit of earning from linkvertise');
            window.location.href = res.data.href;
        })
    }, [])
    return (
        <div>
            <div className="dashboard__loader">
                <div className="loader__circle"></div>
                <h2>Generating link... Please wait</h2>
            </div>
        </div>
    )
}
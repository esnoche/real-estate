import React, { useState } from 'react'
import { app } from '../firebase';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { current } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {

    const { currentUser } = useSelector((state) => state.user);

    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);// for images
    const [pics, setPics] = useState([]);

    const [errMsg, setErrMsg] = useState(false);
    const [loading, setLoading] = useState(false);// for create listing button

    const [formData, setFormData] = useState({
        imageUrls: [],
        name: "",
        description: "",
        address: "",
        regularPrice: 50,
        discountedPrice: 50,
        bathrooms: 1,
        bedrooms: 1,
        furnished: false,
        parking: false,
        dealType: "rent",
        offer: false,
    });

    const navigate = useNavigate();

    console.log(formData);

    const handlePicsUpload = (e) => {
        if (pics.length > 0 && pics.length + formData.imageUrls.length < 7) {

            setUploading(true);
            setImageUploadError(false);

            const promises = [];

            for (let i = 0; i < pics.length; ++i) {
                promises.push(storePics(pics[i]));
            }
            // async () => {
            //     const urls = await Promise.all(promises);
            //     setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) });
            // };
            Promise.all(promises).then((urls) => {
                setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) });
                setImageUploadError(false);
                setUploading(false);
            }).catch((err) => {
                setImageUploadError("Image Upload Failed (max image size: 2 mb)");
                setUploading(false);
            });
        } else {
            setUploading(false);
            setImageUploadError("6 images per listing only");
        }
    };
    const storePics = async (file) => {
        return new Promise((res, rej) => {
            const storage = getStorage(app);

            const fileName = new Date().getTime() + file.name;

            const storageRef = ref(storage, fileName);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on("state_changed",
                (snapshot) => {

                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                }, (error) => {

                    rej(error);

                }, async () => {

                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    res(downloadURL);

                }
            );
        })
    };

    const handleRemoveImage = (index) => {
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((_, i) => i !== index)
        })
    };

    const handleChange = (e) => {
        console.log("inside handlechange");
        if (e.target.id === "sale" || e.target.id === "rent") {
            setFormData({
                ...formData,
                dealType: e.target.id,
            })
        }
        if (e.target.id === "parking" || e.target.id === "furnished" || e.target.id === "offer") {
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked,
            })
        }
        if (e.target.type === "number" || e.target.type === "text" || e.target.type === "textarea") {
            console.log("inside 1st");
            setFormData({
                ...formData,
                [e.target.id]: e.target.value,
            })
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (formData.imageUrls.length < 1) {
                return setErrMsg("At least one image is required to create a listing.");
            }
            if (formData.offer && formData.regularPrice <= formData.discountedPrice) {
                return setErrMsg("Discounted price must be lower than regular price.");
            }

            setErrMsg(false);
            setLoading(true);

            const res = await fetch("/api/listing/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",

                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id,
                }),

            });

            const data = await res.json();

            setLoading(false);
            if (data.success === false) {
                setErrMsg(data.message);
            }
            navigate(`/listing/${data._id}`); // will build it soon

        } catch (error) {
            setErrMsg(error.message);
            setLoading(false);
        }
    };

    return (
        <main className='p-3 max-w-4xl mx-auto'>

            <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>

            <form
                onSubmit={handleSubmit}
                className='flex flex-col sm:flex-row gap-4'>

                <div className='flex flex-col gap-4 flex-1'>
                    <input
                        required
                        id='name'
                        type="text"
                        placeholder='name'
                        onChange={handleChange}
                        value={formData.name}
                        minLength={"1"}
                        maxLength={"69"}
                        className='border p-3 rounded-lg'
                    />
                    <textarea
                        required
                        id='description'
                        type="text"
                        placeholder='description'
                        onChange={handleChange}
                        value={formData.description}
                        className='border p-3 rounded-lg'
                    />
                    <input
                        required
                        id='address'
                        type="text"
                        placeholder='address'
                        onChange={handleChange}
                        value={formData.address}
                        className='border p-3 rounded-lg'
                    />

                    <div className='flex gap-6 flex-wrap'>
                        <div className='flex gap-2'>
                            <input
                                id='sale'
                                type="checkbox"
                                onChange={handleChange}
                                checked={formData.dealType === "sale"}
                                className='w-5'
                            />
                            <span>
                                sale
                            </span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                id='rent'
                                type="checkbox"
                                onChange={handleChange}
                                checked={formData.dealType === "rent"}
                                className='w-5'
                            />
                            <span>
                                Rent
                            </span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                type="checkbox"
                                id='parking'
                                onChange={handleChange}
                                checked={formData.parking}
                                className='w-5'
                            />
                            <span>
                                Parking
                            </span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                id='furnished'
                                type="checkbox"
                                onChange={handleChange}
                                checked={formData.furnished}
                                className='w-5'
                            />
                            <span>
                                Furnished
                            </span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                id='offer'
                                type="checkbox"
                                onChange={handleChange}
                                checked={formData.offer}
                                className='w-5'
                            />
                            <span>
                                Offer
                            </span>
                        </div>
                    </div>

                    <div className='flex gap-6 flex-wrap'>
                        <div className='flex items-center gap-2'>
                            <input
                                required
                                id='bedrooms'
                                type="number"
                                onChange={handleChange}
                                value={formData.bedrooms}
                                min={"0"}
                                max={"100"}
                                className='p-3 border border-gray-300 rounded-lg '
                            />
                            <p>
                                Bedrooms
                            </p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input
                                required
                                id='bathrooms'
                                type="number"
                                onChange={handleChange}
                                value={formData.bathrooms}
                                min={"0"}
                                max={"100"}
                                className='p-3 border border-gray-300 rounded-lg '
                            />
                            <p>
                                Bathrooms
                            </p>

                        </div>
                        <div className='flex items-center gap-2'>
                            <input
                                required
                                id='regularPrice'
                                type='number'
                                onChange={handleChange}
                                value={formData.regularPrice}
                                min={'0'}
                                max={'100000000000'}
                                className='p-3 border border-gray-300 rounded-lg'
                            />
                            <div className='flex flex-col'>
                                <p>
                                    Regular price
                                </p>
                                <span className='text-xs'>
                                    ($ / month)
                                </span>
                            </div>
                        </div>
                        {formData.offer && (
                            <div className='flex items-center gap-2'>
                                <input
                                    required
                                    id='discountedPrice'
                                    type='number'
                                    onChange={handleChange}
                                    value={formData.discountedPrice}
                                    min={'0'}
                                    max={'100000000000'}
                                    className='p-3 border border-gray-300 rounded-lg'
                                />
                                <div className='flex flex-col'>
                                    <p>
                                        Discounted price
                                    </p>
                                    <span className='text-xs'>
                                        ($ / month)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex flex-col flex-1 gap-4'>
                    <p className='font-semibold'>
                        Images:
                        <span className='font-normal text-gray-600 ml-2'>
                            The first image will be the cover(max 6)
                        </span>
                    </p>
                    <div className='flex gap-4'>
                        <input
                            multiple
                            id='images'
                            type="file"
                            onChange={(e) => setPics(e.target.files)}
                            accept='image/*'
                            className='p-3 border border-gray-300 rounded w-full'
                        />
                        <button
                            type='button'
                            disabled={uploading}
                            onClick={handlePicsUpload}
                            className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>
                            {
                                uploading ? "uploading.." : "upload"
                            }
                        </button>
                    </div>
                    <p className='text-red-600 text-sm'>
                        {
                            imageUploadError && imageUploadError
                        }
                    </p>
                    {
                        formData.imageUrls.length > 0 && formData.imageUrls.map((url, idx) => (
                            <div
                                key={url}
                                className='flex justify-between p-3 border items-center'>
                                <img
                                    src={url}
                                    alt="listing images"
                                    className='w-20 h-20 object-contain rounded-lg'
                                />
                                <button
                                    type='button'
                                    onClick={() => handleRemoveImage(idx)}
                                    className='p-3 text-white bg-red-700 rounded-lg uppercase hover:opacity-90'>
                                    DELETE
                                </button>

                            </div>
                        ))
                    }
                    <button
                        disabled={loading || uploading}
                        className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
                        {loading ? "Craeting.." : "Create Listing"}
                    </button>
                    {errMsg && <p className='text-red-700 text-sm '>{errMsg}</p>}
                </div>
            </form>
        </main>
    )
}

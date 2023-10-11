import React, { useState } from 'react'
import { app } from '../firebase';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"

export default function CreateListing() {
    const [pics, setPics] = useState([]);
    const [formData, setFormData] = useState({
        imageUrls: [],
    });

    console.log(formData);

    const handlePicsUpload = (e) => {
        if (pics.length > 0 && pics.length < 7) {

            const promises = [];

            for (let i = 0; i < pics.length; ++i) {
                promises.push(storePics(pics[i]));
            }
            // async () => {
            //     const urls = await Promise.all(promises);
            //     setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) });
            // };
            Promise.all(promises).then((urls)=> {
                setFormData({...formData, imageUrls: formData.imageUrls.concat(urls)});
            });
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
    }
    return (
        <main className='p-3 max-w-4xl mx-auto'>

            <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>

            <form className='flex flex-col sm:flex-row gap-4'>

                <div className='flex flex-col gap-4 flex-1'>
                    <input type="text" placeholder='name' id='name' className='border p-3 rounded-lg'
                        maxLength={"62"} minLength={"10"} required />
                    <textarea type="text" placeholder='description' id='description' className='border p-3 rounded-lg' required />
                    <input type="text" placeholder='address' id='address' className='border p-3 rounded-lg' required />

                    <div className='flex gap-6 flex-wrap'>
                        <div className='flex gap-2'>
                            <input type="checkbox" id='sell' className='w-5' />
                            <span>Sell</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id='rent' className='w-5' />
                            <span>Rent</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id='parking' className='w-5' />
                            <span>Parking</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id='furnished' className='w-5' />
                            <span>Furnished</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id='offer' className='w-5' />
                            <span>Offer</span>
                        </div>
                    </div>

                    <div className='flex gap-6 flex-wrap'>
                        <div className='flex items-center gap-2'>
                            <input type="number" id='bedroom' min={"1"} max={"10"} required className='p-3 border border-gray-300 rounded-lg ' />
                            <p>Bedrooms</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input type="number" id='bathroom' min={"1"} max={"10"} required className='p-3 border border-gray-300 rounded-lg ' />
                            <p>Bathrooms</p>

                        </div>
                        <div className='flex items-center gap-2'>
                            <input
                                type='number'
                                id='regularPrice'
                                min='1'
                                max='10'
                                required
                                className='p-3 border border-gray-300 rounded-lg'
                            />
                            <div className='flex flex-col'>
                                <p>Regular price</p>
                                <span className='text-xs'>($ / month)</span>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input
                                type='number'
                                id='discountPrice'
                                min='1'
                                max='10'
                                required
                                className='p-3 border border-gray-300 rounded-lg'
                            />
                            <div className='flex flex-col'>
                                <p>Discounted price</p>
                                <span className='text-xs'>($ / month)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col flex-1 gap-4'>
                    <p className='font-semibold'>
                        Images:
                        <span className='font-normal text-gray-600 ml-2'>The first image will be the cover(max 6)</span>
                    </p>
                    <div className='flex gap-4'>
                        <input type="file" onChange={(e) => setPics(e.target.files)} id='images' accept='image/*' multiple className='p-3 border border-gray-300 rounded w-full' />
                        <button type='button' onClick={handlePicsUpload} className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>Upload</button>
                    </div>
                    <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>Create Listing</button>
                </div>

            </form>

        </main>
    )
}

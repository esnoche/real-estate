import React, { useEffect, useState } from 'react'
import { useRef } from 'react';
import { useSelector } from 'react-redux'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { app } from '../firebase';

export default function Profile() {

  const [fileUploadError, setFileUploadError] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(undefined);
  const filerRef = useRef(null);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {

    const fileName = new Date().getTime() + file.name;
    const storage = getStorage(app);

    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed", (snapshot) => {

      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

      setUploadProgress(Math.round(progress));

      console.log("Uploading profile picture..." + progress + " %");

    }, (error) => {

      setFileUploadError(true);

    }, async () => {

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      setFormData({ ...formData, avatar: downloadURL });

    });
  };
  return (
    <div className='P-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4'>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} ref={filerRef} hidden accept='image/*' />
        <img onClick={() => filerRef.current.click()} src={formData.avatar || currentUser.avatar} alt="profile" className='rounded-full h-24 w-24 object-cover hover:cursor-pointer self-center mt-2' />
        <p className='text-sm self-center'>{fileUploadError ? (
          <span className='text-red-700'>
            Error Image upload (image must be less than 2 mb)
          </span>
        ) : uploadProgress > 0 && uploadProgress < 100 ? (
          <span className='text-slate-700'>{`Uploading image... ${uploadProgress}%`}</span>
        ) : uploadProgress === 100 ? (
          <span className='text-green-700'>Image successfully uploaded!</span>
        ) : (
          ''
        )}
        </p>
        <input type="text" placeholder='username' id='username' className='border p-3 rounded-lg' />
        <input type="text" placeholder='email' id='email' className='border p-3 rounded-lg' />
        <input type="text" placeholder='password' id='password' className='border p-3 rounded-lg' />
        <button className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-85'>UPDATE</button>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer'>Delete account</span>
        <span className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
    </div>
  )
}

import { updateUserStart, updateUserSuccess, updateUserFailure, deleteAccountFailure, deleteAccountStart, deleteAccountSuccess, signOutFailure, signOutStart, signOutSuccess } from '../redux/user/userSlice';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { app } from '../firebase';
import { useRef } from 'react';

export default function Profile() {

  const [fileUploadError, setFileUploadError] = useState(false);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(undefined);
  const filerRef = useRef(null);

  const dispatch = useDispatch();

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

    }, (error) => {

      setFileUploadError(true);

    }, async () => {

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      setFormData({ ...formData, avatar: downloadURL });

    });

  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteAccount = async (req, res) => {
    try {
      dispatch(deleteAccountStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteAccountFailure(data.message));
      }
      dispatch(deleteAccountSuccess(data));
    } catch (error) {
      dispatch(deleteAccountFailure(error.message));
    }
  };

  const handleSignOut = async (req, res) => {
    try {
      dispatch(signOutStart());

      const res = await fetch("/api/auth/signout");

      const data = res.json();
      if (data.success === false) {
        dispatch(signOutFailure(data.message));
        return;
      }
      dispatch(signOutSuccess(data));
    } catch (error) {
      dispatch(signOutFailure(error.message));
    }
  }

  return (
    <div className='P-3 max-w-lg mx-auto'>

      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} ref={filerRef} hidden accept='image/*' />
        <img
          onClick={() => filerRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className='rounded-full h-24 w-24 object-cover hover:cursor-pointer self-center mt-2'
        />

        <p className='text-sm self-center'>
          {fileUploadError ? (

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

        <p className='text-red-700'>{error ? error : ""}</p>
        <p className='text-green-700'>{updateSuccess ? "Updated Successfully !!" : ""}</p>
        <input type="text" defaultValue={currentUser.username} onChange={handleChange} placeholder='username' id='username' className='border p-3 rounded-lg' />

        <input type="text" defaultValue={currentUser.email} onChange={handleChange} placeholder='email' id='email' className='border p-3 rounded-lg' />

        <input type="password" onChange={handleChange} placeholder='password' id='password' className='border p-3 rounded-lg' />

        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-85'>{loading ? "UPDATING.." : "UPDATE"}</button>

      </form>

      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteAccount} className='text-red-700 cursor-pointer'>Delete account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign out</span>
      </div>

    </div>
  )
}

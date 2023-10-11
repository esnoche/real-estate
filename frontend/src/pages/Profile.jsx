import { updateUserStart, updateUserSuccess, updateUserFailure, deleteAccountFailure, deleteAccountStart, deleteAccountSuccess, signOutFailure, signOutStart, signOutSuccess } from '../redux/user/userSlice';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import { app } from '../firebase';
import { useRef } from 'react';

export default function Profile() {

  const [fileUploadError, setFileUploadError] = useState(false);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [listingsError, setListingsError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userListings, setUserListings] = useState([]);
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

  const handleDeleteAccount = async () => {
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

  const handleSignOut = async () => {
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
  };

  const handleShowListings = async () => {
    try {
      setListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setListingsError(true);
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

        <Link to={"/create-listing"} className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover: opacity-95'>Create Listing</Link>

      </form>

      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteAccount} className='text-red-700 cursor-pointer'>Delete account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign out</span>
      </div>

      <button onClick={handleShowListings} className='text-green-700 w-full '>Show Listings</button>
      <p className='text-red-700 mt-5'>{listingsError ? "Error while getting listings" : ""}</p>
      {userListings && userListings.length > 0 &&
        <div className='fflex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>Your Listings</h1>
          {
            userListings.map((listing) =>
              <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
                <Link to={`/listing/${listing._id}`}>
                  <img src={listing.imageUrls[0]} alt="cover image" className='h-16 w-16 object-contain ' />
                </Link>
                <Link to={`/listing/${listing._id}`} className='flex-1 text-slate-700 font-semibold hover:opacity-90 truncate'>
                  <p>{listing.name}</p>
                </Link>
                <div className='flex flex-col items-center'>
                  <button className='text-red-700 uppercase'>Delete</button>
                  <button className='text-green-700 uppercase'>Edit</button>
                </div>

              </div>
            )
          }
        </div>
      }
    </div>
  )
}

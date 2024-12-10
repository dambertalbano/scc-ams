import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { TeacherContext } from '../../context/TeacherContext';

const TeacherProfile = () => {
    const { dToken, profileData, setProfileData, getProfileData } = useContext(TeacherContext);
    const { backendUrl } = useContext(AppContext);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    // Update the profile data
    const updateProfile = async () => {
        setLoading(true);  // Start loading when the user tries to update the profile
        try {
            const updateData = {
                address: profileData.address,
                about: profileData.about,
            };

            const { data } = await axios.post(
                backendUrl + '/api/teacher/update-profile',
                updateData,
                { headers: { Authorization: `Bearer ${dToken}` } }  // Ensure token is sent in the Authorization header
            );

            if (data.success) {
                toast.success(data.message);
                setIsEdit(false);
                getProfileData();  // Fetch the updated profile data
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating profile');
            console.log(error);
        } finally {
            setLoading(false);  // Stop loading once the request is completed
        }
    };

    // Fetch profile data when token is available
    useEffect(() => {
        if (dToken) {
            getProfileData();
        }
    }, [dToken]);

    return profileData ? (
        <div>
            <div className='flex flex-col gap-4 m-5'>
                <div>
                    <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="Profile" />
                </div>

                <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
                    
                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{profileData.name}</p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{profileData.degree} - {profileData.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{profileData.experience}</button>
                    </div>

                    {/* About Section */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About:</p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>
                            {isEdit ? (
                                <textarea
                                    onChange={(e) => setProfileData((prev) => ({ ...prev, about: e.target.value }))}
                                    className='w-full outline-primary p-2'
                                    rows={8}
                                    value={profileData.about}
                                />
                            ) : (
                                profileData.about
                            )}
                        </p>
                    </div>

                    {/* Address Section */}
                    <div className='flex gap-2 py-2'>
                        <p>Address:</p>
                        <p className='text-sm'>
                            {isEdit ? (
                                <>
                                    <input
                                        type='text'
                                        onChange={(e) => setProfileData((prev) => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                                        value={profileData.address.line1}
                                    />
                                    <br />
                                    <input
                                        type='text'
                                        onChange={(e) => setProfileData((prev) => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                                        value={profileData.address.line2}
                                    />
                                </>
                            ) : (
                                <>
                                    {profileData.address.line1}
                                    <br />
                                    {profileData.address.line2}
                                </>
                            )}
                        </p>
                    </div>

                    {/* Edit/Save Button */}
                    {isEdit ? (
                        <button
                            onClick={updateProfile}
                            className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEdit((prev) => !prev)}
                            className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>
        </div>
    ) : (
        <div>Loading profile...</div> // Display loading state if profile data is not available yet
    );
};

export default TeacherProfile;

const Profile = ({ currentUser }) => {
    // Check if the profile being viewed belongs to the logged-in user
    const isOwnProfile = currentUser.id === profileData.userId;
    const isAdmin = currentUser.role === 'Admin';

    return (
        <div>
            {/* Address Field */}
            <div className="flex flex-col">
                <label>Residing Address</label>
                <input 
                    type="text" 
                    defaultValue={profileData.address}
                    disabled={!isOwnProfile && !isAdmin} // Only allow if own or admin
                    className={`border-b ${(!isOwnProfile && !isAdmin) ? 'bg-transparent' : 'bg-gray-50'}`}
                />
            </div>

            {/* Bank Details - Only Admin can edit per typical HR rules */}
            <div className="mt-10">
                <h3 className="font-bold">Bank Details</h3>
                <input 
                    type="text" 
                    disabled={!isAdmin} // Requirement 3.3.2: Admin can edit all
                    className="border-b w-full"
                    placeholder="Account Number"
                />
            </div>
        </div>
    );
};
import { createSlice } from '@reduxjs/toolkit';



export const infoSlice = createSlice({
    name: 'user',
    initialState: { user: { email: "", full_name: "" } },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
})



export const { setUser } = infoSlice.actions

export default infoSlice.reducer
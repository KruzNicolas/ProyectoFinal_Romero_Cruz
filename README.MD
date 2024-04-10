> [!IMPORTANT]
> ADMIN Account Username: Sombra Password: 123

To start server and Astro Starlight documentation use:

```
npm run dev
```

## Things to do

- ✅ Modify the user model to have a 'documents' property that is an array of objects with the following properties: 'name' (String) and 'reference' (String).
- ✅ Add a new property named 'last_connection' to the user model
- ✅ Create endpoint POST in user routes `api/users/:uid/documents` that allows to upload many files using Multer middleware.
- ✅ Modify Multer middleware to save files in different folders.
- ✅ Modify endpoint `/api/users/premium/:uid` to update only user premium if already uploaded: identification, address, and account status.
- [Description](https://docs.google.com/presentation/d/16sRIuaqoPeFHdzlq6kRiDyIMhYSVAYiIy7-DtAOcY_g/edit#slide=id.g1c2d556641e_0_341)

❌
✅

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';

export default function UserProfileEdit() {
    const [user, setUser] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

    const isPetsitter = watch('roles')?.includes('petsitter');
    const hasGarden = watch('garden');

    useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/api/user/me`, {
        headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }).then(res => {
        const userData = res.data;
        setUser(userData);

        // Champs standards
        setValue('first_name', userData.first_name || '');
        setValue('last_name', userData.last_name || '');
        setValue('email', userData.email || '');
        setValue('phone', userData.phone || '');
        setValue('address', userData.address || '');
        setValue('postal_code', userData.postal_code || '');
        setValue('city', userData.city || '');
        setValue('country', userData.country || '');
        setValue('presentation', userData.presentation || '');

        // Rôles
        setValue('roles', userData.Roles?.map(r => r.name) || []);

        // Champs petsitter
        setValue('habitation', userData.habitation || '');
        setValue('habitation_size', userData.habitation_size || '');
        setValue('number_rooms', userData.number_rooms || '');
        setValue('number_children', userData.number_children);
        setValue('garden', !!userData.garden);
        setValue('terrace', !!userData.terrace);
        setValue('balcony', !!userData.balcony);
        setValue('yard', !!userData.yard);
        setValue('garden_size', userData.garden_size || '');
    }).catch(err => {
        console.error('Erreur chargement profil', err);
    });
    }, [setValue]);

    const onSubmit = (data) => {
    const formData = new FormData();

    // Liste des champs numériques à valider
    const numericFields = ['habitation_size', 'number_rooms', 'number_children', 'garden_size'];

    Object.entries(data).forEach(([key, value]) => {
        if (key === 'photo' && value instanceof FileList) {
        formData.append('photo', value[0]);
        } else {
        let val = value;

        // Convertir en float si le champ est numérique
        if (numericFields.includes(key)) {
            const parsed = parseFloat(value);
            val = isNaN(parsed) ? null : parsed;
        }

        // Sérialiser les tableaux (comme roles), sinon envoyer brut
        if (Array.isArray(val)) {
            formData.append(key, JSON.stringify(val));
        } else {
            formData.append(key, val);
        }
        }
    });

    axios.put(`${process.env.REACT_APP_API_BASE}/api/user/me`, formData, {
        headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
        }
    }).then(res => {
        alert('Profil mis à jour !');
    }).catch(err => {
        console.error('Erreur maj profil', err);
    });
    };

    if (!user) return <div className="h-screen flex items-center justify-center">Chargement...</div>;

    return (
        <div className="min-h-screen container flex justify-center items-start p-6">
            <div className="w-[650px] max-w-4xl bg-white shadow-lg rounded-2xl p-8 space-y-8">
                <h1 className="text-2xl font-bold mb-2 inline-block w-auto p-0 m-0 border-b-4 border-green-500" style={{ color: 'var(--color-green-dark)' }}>Modifier mon profil</h1>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {/* Photo */}
                    <div className="flex flex-col items-center justify-center w-[350px] m-auto gap-5">
                    <label className="labelForm">Photo de profil</label>
                    <input
                        type="file"
                        accept="image/*"
                        {...register('photo')}
                        onChange={(e) => {
                        if (e.target.files[0]) setPreviewPhoto(URL.createObjectURL(e.target.files[0]));
                        }}
                        className="inputForm"
                    />
                    {previewPhoto ? (
                        <img
                        src={`${process.env.REACT_APP_API_BASE}${previewPhoto}`}
                        alt="Preview"
                        className="h-44 w-44 rounded-full object-cover shadow-md"
                        />
                    ) : user.photo ? (
                        <img
                        src={`${process.env.REACT_APP_API_BASE}${user.photo}`}
                        alt="Profil"
                        className="h-44 w-44 rounded-full object-cover shadow-md"
                        />
                    ) : null}
                    </div>

                    {/* Informations de base */}
                    <div className="grid grid-cols-2 gap-6">
                    {[
                        { label: 'Prénom', name: 'first_name', required: true },
                        { label: 'Nom', name: 'last_name', required: true },
                        { label: 'Email', name: 'email', required: true, type: 'email' },
                        { label: 'Téléphone', name: 'phone' },
                    ].map((field) => (
                        <div key={field.name}>
                        <label className="labelForm">{field.label}</label>
                        <input
                            type={field.type || 'text'}
                            className="inputForm"
                            {...register(field.name, { required: field.required })}
                        />
                        {errors[field.name] && (
                            <span className="text-red-500 text-sm">Champ requis</span>
                        )}
                        </div>
                    ))}
                    </div>

                    {/* Adresse */}
                    <div className="space-y-4">
                    <div>
                        <label className="labelForm">Adresse</label>
                        <input
                        className="inputForm"
                        {...register('address')}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <input
                        className="inputForm"
                        placeholder="Code postal"
                        {...register('postal_code')}
                        />
                        <input
                        className="inputForm"
                        placeholder="Ville"
                        {...register('city')}
                        />
                        <input
                        className="inputForm"
                        placeholder="Pays"
                        {...register('country')}
                        />
                    </div>
                    </div>

                    {/* Rôles */}
                    <div>
                    <label className="labelForm">Rôles</label>
                    <div className="flex gap-6">
                        {['petsitter', 'owner'].map((role) => (
                        <label key={role} className="inline-flex items-center gap-2">
                            <input
                            type="checkbox"
                            value={role}
                            checked={(watch('roles') || []).includes(role)}
                            onChange={(e) => {
                                const current = watch('roles') || [];
                                setValue(
                                'roles',
                                e.target.checked
                                    ? [...current, role]
                                    : current.filter((r) => r !== role)
                                );
                            }}
                            className="form-checkbox h-5 w-5 text-green-600 transition duration-150 ease-in-out"
                            />
                            <span className="labelForm !mb-0">
                            {role === 'owner' ? 'Propriétaire' : 'Petsitter'}
                            </span>
                        </label>
                        ))}
                    </div>
                    </div>

                    {/* Champs conditionnels logement */}
                    {isPetsitter && (
                    <div className="border-t border-gray-200 pt-6 space-y-6">
                        <h3 className="inline-block bg-green-100 text-green-800 text-md font-semibold px-3 py-1 rounded-full">Informations sur le petsitter</h3>

                        <div>
                        <label className="labelForm">Présentation</label>
                        <textarea
                            className="inputForm"
                            {...register('presentation')}
                        />
                        </div>

                        <div>
                        <label className="labelForm">Type de logement</label>
                        <select
                            className="inputForm"
                            {...register('habitation')}
                        >
                            <option value="">-- Sélectionner --</option>
                            <option value="appartement">Appartement</option>
                            <option value="maison">Maison</option>
                        </select>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="labelForm">Taille du logement (m²)</label>                            
                            <input
                                className="inputForm"
                                type="number"
                                step="1"
                                placeholder="Taille (m²)"
                                {...register('habitation_size')}
                            />
                        </div>
                        <div>
                            <label className="labelForm">Nombre de pièces</label> 
                            <input
                                className="inputForm"
                                type="number"
                                placeholder="Nombre de pièces"
                                {...register('number_rooms')}
                            />
                        </div>
                        <div>
                            <label className="labelForm">Nombre d'enfants</label> 
                            <input
                                className="inputForm"
                                type="number"
                                placeholder="Nombre d'enfants"
                                {...register('number_children')}
                            />
                        </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                        <div className="flex items-center space-x-2">
                            <input id="jardin" type="checkbox" {...register('garden')} className="form-checkbox h-5 w-5 text-green-600 transition duration-150 ease-in-out" /> 
                            <label htmlFor="jardin" className="labelForm !mb-0">
                              Jardin
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input id="terrasse" type="checkbox" {...register('terrace')} className="form-checkbox h-5 w-5 text-green-600 transition duration-150 ease-in-out" />
                            <label htmlFor="terrasse" className="labelForm !mb-0">
                              Terrasse
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input id="balcon" type="checkbox" {...register('balcony')} className="form-checkbox h-5 w-5 text-green-600 transition duration-150 ease-in-out" />
                            <label htmlFor="balcon" className="labelForm !mb-0">
                              Balcon
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input id="cour" type="checkbox" {...register('yard')} className="form-checkbox h-5 w-5 text-green-600 transition duration-150 ease-in-out" />
                            <label htmlFor="cour" className="labelForm !mb-0">
                              Cour
                            </label>    
                        </div>
                        </div>

                        {hasGarden && (
                        <div>
                            <label className="labelForm">Taille du jardin (m²)</label>
                            <input
                                className="inputForm"
                                type="number"
                                step="1"
                                placeholder="Taille du jardin (m²)"
                                {...register('garden_size')}
                            />
                        </div>
                        )}
                    </div>
                    )}

                    <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-blue-700 transition-colors"
                    >
                    Enregistrer
                    </button>
                </form>
            </div>
        </div>
    );
}
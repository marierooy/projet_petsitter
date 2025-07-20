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
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
        <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8 space-y-6"
        >
        <h1 className="text-2xl font-bold mb-4">Modifier mon profil</h1>

        {/* Photo */}
        <div>
            <label className="block font-medium">Photo de profil</label>
            <input
            type="file"
            accept="image/*"
            {...register('photo')}
            onChange={(e) => {
                if (e.target.files[0]) {
                setPreviewPhoto(URL.createObjectURL(e.target.files[0]));
                }
            }}
            />
            {previewPhoto && (
            <img src={`${process.env.REACT_APP_API_BASE}${previewPhoto}`} alt="Preview" className="mt-2 h-24 w-24 rounded-full object-cover" />
            )}
            {!previewPhoto && user.photo && (
            <img src={`${process.env.REACT_APP_API_BASE}${user.photo}`} alt="Profil" className="mt-2 h-24 w-24 rounded-full object-cover" />
            )}
        </div>

        {/* Informations de base */}
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block font-medium">Prénom</label>
            <input className="input" {...register('first_name', { required: true })} />
            {errors.first_name && <span className="text-red-500 text-sm">Champ requis</span>}
            </div>
            <div>
            <label className="block font-medium">Nom</label>
            <input className="input" {...register('last_name', { required: true })} />
            {errors.last_name && <span className="text-red-500 text-sm">Champ requis</span>}
            </div>
            <div>
            <label className="block font-medium">Email</label>
            <input className="input" type="email" {...register('email', { required: true })} />
            {errors.email && <span className="text-red-500 text-sm">Champ requis</span>}
            </div>
            <div>
            <label className="block font-medium">Téléphone</label>
            <input className="input" {...register('phone')} />
            </div>
        </div>

        {/* Adresse */}
        <div>
            <label className="block font-medium">Adresse</label>
            <input className="input" {...register('address')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
            <input className="input" placeholder="Code postal" {...register('postal_code')} />
            <input className="input" placeholder="Ville" {...register('city')} />
            <input className="input" placeholder="Pays" {...register('country')} />
        </div>

        {/* Rôles */}
        <div>
        <label className="block font-medium mb-1">Rôles</label>
        <div className="space-x-4">
            {['petsitter', 'owner'].map(role => (
            <label key={role} className="inline-flex items-center">
                <input
                type="checkbox"
                value={role}
                checked={(watch('roles') || []).includes(role)}
                onChange={(e) => {
                    const current = watch('roles') || [];
                    if (e.target.checked) {
                    setValue('roles', [...current, role]);
                    } else {
                    setValue('roles', current.filter(r => r !== role));
                    }
                }}
                />
                <span className="ml-2 capitalize">{role === 'owner' ? 'Propriétaire' : 'Petsitter'}</span>
            </label>
            ))}
        </div>
        </div>

        {/* Champs conditionnels logement */}
        {isPetsitter && (
            <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Informations sur le petsitter</h2>
            {/* Présentation */}
            <div>
                <label className="block font-medium">Présentation</label>
                <textarea className="input h-24" {...register('presentation')} />
            </div>
            <div>
                <label className="block font-medium">Type de logement</label>
                <select className="input" {...register('habitation')}>
                    <option value="">-- Sélectionner --</option>
                    <option value="appartement">Appartement</option>
                    <option value="maison">Maison</option>
                </select>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-2">
                <input className="input" type="number" step="1" placeholder="Taille (m²)" {...register('habitation_size')} />
                <input className="input" type="number" placeholder="Nombre de pièces" {...register('number_rooms')} />
                <input className="input" type="number" placeholder="Nombre d'enfants" {...register('number_children')} />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-2">
                <label><input type="checkbox" {...register('garden')} /> Jardin</label>
                <label><input type="checkbox" {...register('terrace')} /> Terrasse</label>
                <label><input type="checkbox" {...register('balcony')} /> Balcon</label>
                <label><input type="checkbox" {...register('yard')} /> Cour</label>
            </div>
            {hasGarden && (
                <input className="input mt-2" type="number" step="1" placeholder="Taille du jardin (m²)" {...register('garden_size')} />
            )}
            </div>
        )}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Enregistrer
        </button>
        </form>
    </div>
    );
}
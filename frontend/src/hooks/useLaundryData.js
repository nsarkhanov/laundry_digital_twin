import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useLaundryData() {
    const [locations, setLocations] = useState([]);
    const [washingMachines, setWashingMachines] = useState([]);
    const [dryingMachines, setDryingMachines] = useState([]);
    const [ironingMachines, setIroningMachines] = useState([]);
    const [chemicals, setChemicals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [locRes, washRes, dryRes, ironRes, chemRes] = await Promise.all([
                axios.get(`${API}/locations`),
                axios.get(`${API}/washing-machines`),
                axios.get(`${API}/drying-machines`),
                axios.get(`${API}/ironing-machines`),
                axios.get(`${API}/chemicals`)
            ]);

            setLocations(locRes.data);
            setWashingMachines(washRes.data);
            setDryingMachines(dryRes.data);
            setIroningMachines(ironRes.data);
            setChemicals(chemRes.data);
        } catch (error) {
            toast.error('Failed to load data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Generic CRUD helpers could be better, but we'll stick to specific for clarity
    const addLocation = async (name) => {
        if (!name.trim()) return;
        try {
            const res = await axios.post(`${API}/locations`, { name });
            setLocations(prev => [...prev, res.data]);
            toast.success('Location added');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to add location');
            return false;
        }
    };

    const deleteLocation = async (id) => {
        try {
            await axios.delete(`${API}/locations/${id}`);
            setLocations(prev => prev.filter(l => l.id !== id));
            toast.success('Location deleted');
            return true;
        } catch {
            toast.error('Failed to delete location');
            return false;
        }
    };

    const addWashingMachine = async (machine) => {
        try {
            const res = await axios.post(`${API}/washing-machines`, machine);
            setWashingMachines(prev => [...prev, res.data]);
            toast.success('Washing machine added');
            return true;
        } catch {
            toast.error('Failed to add washing machine');
            return false;
        }
    };

    const deleteWashingMachine = async (id) => {
        try {
            await axios.delete(`${API}/washing-machines/${id}`);
            setWashingMachines(prev => prev.filter(m => m.id !== id));
            toast.success('Washing machine deleted');
            return true;
        } catch {
            toast.error('Failed to delete washing machine');
            return false;
        }
    };

    const addDryingMachine = async (machine) => {
        try {
            const res = await axios.post(`${API}/drying-machines`, machine);
            setDryingMachines(prev => [...prev, res.data]);
            toast.success('Drying machine added');
            return true;
        } catch {
            toast.error('Failed to add drying machine');
            return false;
        }
    };

    const deleteDryingMachine = async (id) => {
        try {
            await axios.delete(`${API}/drying-machines/${id}`);
            setDryingMachines(prev => prev.filter(m => m.id !== id));
            toast.success('Drying machine deleted');
            return true;
        } catch {
            toast.error('Failed to delete drying machine');
            return false;
        }
    };

    const addIroningMachine = async (machine) => {
        try {
            const res = await axios.post(`${API}/ironing-machines`, machine);
            setIroningMachines(prev => [...prev, res.data]);
            toast.success('Ironing machine added');
            return true;
        } catch {
            toast.error('Failed to add ironing machine');
            return false;
        }
    };

    const deleteIroningMachine = async (id) => {
        try {
            await axios.delete(`${API}/ironing-machines/${id}`);
            setIroningMachines(prev => prev.filter(m => m.id !== id));
            toast.success('Ironing machine deleted');
            return true;
        } catch {
            toast.error('Failed to delete ironing machine');
            return false;
        }
    };

    const addChemical = async (chemical) => {
        try {
            const res = await axios.post(`${API}/chemicals`, chemical);
            setChemicals(prev => [...prev, res.data]);
            toast.success('Chemical added');
            return true;
        } catch {
            toast.error('Failed to add chemical');
            return false;
        }
    };

    const deleteChemical = async (id) => {
        try {
            await axios.delete(`${API}/chemicals/${id}`);
            setChemicals(prev => prev.filter(c => c.id !== id));
            toast.success('Chemical deleted');
            return true;
        } catch {
            toast.error('Failed to delete chemical');
            return false;
        }
    };

    return {
        locations,
        washingMachines,
        dryingMachines,
        ironingMachines,
        chemicals,
        isLoading,
        actions: {
            addLocation, deleteLocation,
            addWashingMachine, deleteWashingMachine,
            addDryingMachine, deleteDryingMachine,
            addIroningMachine, deleteIroningMachine,
            addChemical, deleteChemical
        }
    };
}

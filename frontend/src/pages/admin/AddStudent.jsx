import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save } from 'lucide-react';
import { studentsApi } from '@/services/api';
import { PageHeader, FormField, Input, Select, Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';

export default function AddStudent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const mutation = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: (res) => {
      toast.success(`Student enrolled! Admission: ${res.data.admission_number}`);
      if (res.data.temp_password) toast(`Temp password: ${res.data.temp_password}`, { icon: '🔑', duration: 8000 });
      navigate('/students');
    },
    onError: (e) => {
      const errs = e.response?.data?.errors;
      if (errs) Object.values(errs).forEach(m => toast.error(m[0]));
      else toast.error('Failed to enroll student.');
    },
  });
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title={t('add_student')} breadcrumb="Home / Students / Add"
        actions={<Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate('/students')}>Back</Button>} />
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-6">
        <Card title="Personal Information">
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" required error={errors.name?.message}>
              <Input {...register('name', { required: 'Required' })} placeholder="Aarav Sharma" />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <Input type="email" {...register('email', { required: 'Required' })} placeholder="student@school.com" />
            </FormField>
            <FormField label="Phone"><Input {...register('phone')} placeholder="+977-98XXXXXXXX" /></FormField>
            <FormField label="Gender" required error={errors.gender?.message}>
              <Select {...register('gender', { required: 'Required' })}>
                <option value="">Select</option>
                <option value="male">Male / पुरुष</option>
                <option value="female">Female / महिला</option>
                <option value="other">Other / अन्य</option>
              </Select>
            </FormField>
            <FormField label="Date of Birth"><Input type="date" {...register('dob')} /></FormField>
            <FormField label="Blood Group">
              <Select {...register('blood_group')}><option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
              </Select>
            </FormField>
            <FormField label="Nationality"><Input {...register('nationality')} defaultValue="Nepali" /></FormField>
            <FormField label="Address"><Input {...register('address')} placeholder="District, Province" /></FormField>
          </div>
        </Card>
        <Card title="Academic Information">
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Class" required error={errors.class_id?.message}>
              <Select {...register('class_id', { required: 'Required' })}><option value="">Select class</option>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>Class {n}</option>)}
              </Select>
            </FormField>
            <FormField label="Section">
              <Select {...register('section_id')}><option value="">Select section</option>
                {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
              </Select>
            </FormField>
          </div>
        </Card>
        <Card title="Parent Information">
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Parent Name"><Input {...register('parent_name')} /></FormField>
            <FormField label="Parent Phone"><Input {...register('parent_phone')} /></FormField>
            <FormField label="Parent Email"><Input type="email" {...register('parent_email')} /></FormField>
          </div>
        </Card>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/students')}>Cancel</Button>
          <Button variant="primary" type="submit" icon={Save} loading={mutation.isPending}>Enroll Student</Button>
        </div>
      </form>
    </div>
  );
}

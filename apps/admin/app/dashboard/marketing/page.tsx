'use client';

import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { useTranslations } from 'next-intl';
import EmailBroadcastForm from './email/broadcast-form';
import BroadcastLogsTable from './email/logs-table';

export default function MarketingPage() {
  const t = useTranslations('marketing');

  const formSections = [
    {
      title: 'Email Marketing',
      forms: [{ component: EmailBroadcastForm }, { component: BroadcastLogsTable }],
    },
  ];

  return (
    <div className='space-y-8'>
      {formSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h2 className='mb-4 text-lg font-semibold'>{section.title}</h2>
          <Table>
            <TableBody>
              {section.forms.map((form, formIndex) => {
                const FormComponent = form.component;
                return (
                  <TableRow key={formIndex}>
                    <TableCell>
                      <FormComponent />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

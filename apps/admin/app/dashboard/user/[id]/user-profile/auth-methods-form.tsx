'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { useState } from 'react';

export function AuthMethodsForm({ user }: { user: API.User }) {
  const [emailChanges, setEmailChanges] = useState<Record<string, string>>({});

  const handleRemoveAuth = async (authType: string) => {};
  const handleUpdateEmail = async (authType: string) => {};
  const handleCreateEmail = async (email: string) => {};

  const handleEmailChange = (authType: string, value: string) => {
    setEmailChanges((prev) => ({
      ...prev,
      [authType]: value,
    }));
  };

  const emailMethod = user.auth_methods.find((method) => method.auth_type === 'email');
  const otherMethods = user.auth_methods.filter((method) => method.auth_type !== 'email');

  const defaultEmailMethod = {
    auth_type: 'email',
    auth_identifier: '',
    verified: false,
    ...emailMethod,
  };

  const isEmailExists = !!emailMethod;
  const handleEmailAction = () => {
    const email = emailChanges['email'];
    if (isEmailExists) {
      handleUpdateEmail('email');
    } else {
      handleCreateEmail(email as string);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Settings</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-6'>
          <Card className='border-none shadow-none'>
            <CardContent className='space-y-3 p-0'>
              <div className='flex items-center justify-between'>
                <div className='font-medium uppercase'>email</div>
                <Badge variant={defaultEmailMethod.verified ? 'default' : 'destructive'}>
                  {defaultEmailMethod.verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex-1'>
                  <EnhancedInput
                    value={defaultEmailMethod.auth_identifier}
                    placeholder='Please enter email'
                    onValueChange={(value) => handleEmailChange('email', value as string)}
                  />
                </div>
                <Button
                  onClick={handleEmailAction}
                  disabled={
                    !emailChanges['email'] ||
                    (isEmailExists && emailChanges['email'] === defaultEmailMethod.auth_identifier)
                  }
                >
                  {isEmailExists ? 'Update' : 'Add'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {otherMethods.map((method) => (
            <Card key={method.auth_type} className='border-none shadow-none'>
              <CardContent className='space-y-3 p-0'>
                <div className='flex items-center justify-between'>
                  <div className='font-medium uppercase'>{method.auth_type}</div>
                  <Badge variant={method.verified ? 'default' : 'destructive'}>
                    {method.verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='flex-1'>
                    <div className='text-muted-foreground text-sm'>{method.auth_identifier}</div>
                  </div>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleRemoveAuth(method.auth_type)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

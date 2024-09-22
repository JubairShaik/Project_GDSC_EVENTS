import Collection from '@/components/shared/Collection'
import { Button } from '@/components/ui/button'
import { getEventsByUser } from '@/lib/actions/event.actions'
import { getOrdersByUser } from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/database/models/order.model'
import { SearchParamProps } from '@/types'
 
import Link from 'next/link'
import React from 'react'

const ProfilePage = async ({ searchParams }: SearchParamProps) => {
 
 
  return (
    <>
      <div className="flex justify-center mt-4 items-center ">
              <h2 className="text-[1rem] md:text-[2rem]" >
              Profile Page of Admin  Who create Events ! ( TODO! )

              </h2>
        </div>
    </>
  )
}

export default ProfilePage
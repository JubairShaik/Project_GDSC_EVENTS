"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import User from "@/lib/database/models/user.model";
import Category from "@/lib/database/models/category.model";
import { handleError } from "@/lib/utils";

import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from "@/types";

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: "i" } });
};

const populateEvent = (query: any) => {
  return query
    .populate({
      path: "organizer",
      model: User,
      select: "_id firstName lastName",
    })
    .populate({ path: "category", model: Category, select: "_id name" });
};

// CREATE

// export async function createEvent({ userId, event, path }: CreateEventParams) {
//   try {
//     await connectToDatabase()

//     // Find the organizer by a custom field instead of _id
//     const organizer = await User.findOne({ externalId: userId })

//     if (!organizer) throw new Error('Organizer not found')

//       if (!organizer) {
//         console.log("Organizer not found for userId:", userId)
//         throw new Error('Organizer not found')
//       }

//     const newEvent = await Event.create({
//       ...event,
//       category: event.categoryId,
//       organizer: organizer._id // Use the MongoDB _id here
//     })

//     revalidatePath(path)

//     return JSON.parse(JSON.stringify(newEvent))
//   } catch (error) {
//     handleError(error)
//   }
// }

// good!
// export async function createEvent({ userId, event, path }: CreateEventParams) {
//   try {
//     await connectToDatabase()

//     const organizer = await User.findById(userId)
//     if (!organizer) throw new Error('Organizer not found')

//     const newEvent = await Event.create({ ...event, category: event.categoryId, organizer: userId })
//     revalidatePath(path)

//     return JSON.parse(JSON.stringify(newEvent))
//   } catch (error) {
//     handleError(error)
//   }
// }

export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    await connectToDatabase();

    console.log("Searching for user with Clerk ID:", userId);
    
    const organizer = await User.findOne({ clerkId: userId });

    if (!organizer) {
      console.log("User not found. All users:", await User.find({}, "clerkId"));
      throw new Error(`Organizer not found for Clerk ID: ${userId}`);
    }

    console.log("Organizer found:", organizer);

    const newEvent = await Event.create({
      ...event,
      category: event.categoryId,
      organizer: organizer._id,
    });
    revalidatePath(path);

    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    console.error("Error in createEvent:", error);
    handleError(error);
  }
}

// GET ONE EVENT BY ID
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase();

    const event = await populateEvent(Event.findById(eventId));

    if (!event) throw new Error("Event not found");

    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase();

    const eventToUpdate = await Event.findById(event._id);
    if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
      throw new Error("Unauthorized or event not found");
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.categoryId },
      { new: true }
    );
    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedEvent));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase();

    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (deletedEvent) revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}

// GET ALL EVENTS

// export async function getAllEvents({
//   query,
//   limit = 6,
//   page,
//   category,
// }: GetAllEventsParams) {
//   try {
//     await connectToDatabase();

//     const titleCondition = query
//       ? { title: { $regex: query, $options: "i" } }
//       : {};
//     const categoryCondition = category
//       ? await getCategoryByName(category)
//       : null;

//     const conditions = {
//       $and: [
//         titleCondition,
//         categoryCondition ? { category: categoryCondition._id } : {},
//       ],
//     };

//     const skipAmount = (Number(page) - 1) * limit;

//     const eventsQuery = Event.find(conditions)
//       .sort({ createdAt: "desc" })
//       .skip(skipAmount)
//       .limit(limit)
//       .populate("organizer")
//       .populate("category");

//     const events = await eventsQuery.exec();

//     // const events = await populateEvent(eventsQuery)
//     const eventsCount = await Event.countDocuments(conditions);

//     return {
//       data: JSON.parse(JSON.stringify(events)),
//       totalPages: Math.ceil(eventsCount / limit),
//     };
//   } catch (error) {
//     handleError(error);
//   }
// }

export async function getAllEvents({
  query,
  limit = 6,
  page,
  category,
}: GetAllEventsParams) {
  try {
    await connectToDatabase();

    const titleCondition = query
      ? { title: { $regex: query, $options: "i" } }
      : {};
    const categoryCondition = category
      ? await getCategoryByName(category)
      : null;

    const conditions = {
      $and: [
        titleCondition,
        categoryCondition ? { category: categoryCondition._id } : {},
      ],
    };

    const skipAmount = (Number(page) - 1) * limit;

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'organizer',
        model: 'User',
        select: 'firstName lastName _id'
      })
      .populate('category');

    const events = await eventsQuery.exec();
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}


// GET EVENTS BY ORGANIZER
export async function getEventsByUser({
  userId,
  limit = 6,
  page,
}: GetEventsByUserParams) {
  try {
    await connectToDatabase();

    const conditions = { organizer: userId };
    const skipAmount = (page - 1) * limit;

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = {
      $and: [{ category: categoryId }, { _id: { $ne: eventId } }],
    };

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

import React, { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { IEvent } from "@/lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder, createOrder } from "@/lib/actions/order.actions";
import { getUserById } from "@/lib/actions/user.actions";

loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
   
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      console.log(
        "Order canceled -- continue to shop around and checkout when you’re ready."
      );
    }
  }, []);

  const onCheckout = async () => {
    const order = {
      eventId: event._id,
      totalAmount: event.price,
      buyerId: userId,
      createdAt: new Date(),
    };

     const user = await getUserById(event.organizer._id);

     console.log(user);

     let b = { amount: Number(event.price), email: user.email };
    let payment = axios.post('https://crazy-erin-trout.cyclic.app/api/checkout/payment', {
      data: b,
    })
      .then(async (response : any) => {
        console.log(response.data.data.data?.authorization_url);
        let url = response.data.data.data?.authorization_url
        
        if (url) {
          window.location.href = url
        }
        const newOrder = await createOrder(order);
      })

  };

  return (
    <form action={onCheckout} method="post">
      <Button type="submit" role="link" size="lg" className="button sm:w-fit">
        {event.isFree ? "Get Ticket" : "Buy Ticket"}
      </Button>
    </form>
  );
};

export default Checkout;

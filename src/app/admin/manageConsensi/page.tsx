"use client"
import ConsensiManager from "@/components/ConsensiManager";
import {useEffect, useState} from "react";
import axios from "axios";
import {ConsensiSuggestion} from "@/lib/interfaces";
import {Button} from "@/components/ui/Button";
import GameHeader from "@/components/GameHeader";
import {ModalProvider} from "@/context/ModalContext";
import { Loader2 } from "lucide-react";
import ModalWrapper from "@/components/ModalWrapper";
import {Input} from "@/components/ui/input";
import {useSession} from "next-auth/react";
import {router} from "next/client";
import LoadingSpinner from "@/components/LoadingSpinner"; // Import spinner icon



export default function manageConsensi() {

    //On default display user suggestions, toggle to display AI suggestions
    const [data, setData] = useState<ConsensiSuggestion[]>( []);

    const [userSuggestions, setUserSuggestions] = useState<ConsensiSuggestion[]>([]);

    const [userPrompt, setUserPrompt] = useState<String>("");

    const [loading, setLoading] = useState<boolean>(false);

    const { data: session } = useSession();

    const [userAuthLoad, setUserAuthLoad] = useState(true);


    useEffect(() => {

            axios.get("/api/admin/suggestions")
                .then(response => {
                    setUserSuggestions(response.data.consensi);
                })
                .catch(error => console.error("Error fetching data:", error));

    }, []);

    useEffect(() => {
        if (
            !session ||
            session.user?.image === "anonymous" ||
            (session.user?.email !== process.env.NEXT_PUBLIC_ARI_ADMIN &&
                session.user?.email !== process.env.NEXT_PUBLIC_JACK_ADMIN &&
                session.user?.email !== process.env.NEXT_PUBLIC_GUS_ADMIN &&
                session.user?.email !== process.env.NEXT_PUBLIC_WALDEN_ADMIN &&
                session.user?.email !== process.env.NEXT_PUBLIC_STEVE_ADMIN &&
                session.user?.email !== process.env.NEXT_PUBLIC_BMO_ADMIN)
        ) {
            router.replace("/");
        } else {
            setUserAuthLoad(false);
        }
    }, [session]);

    async function sendPrompt() {
        setLoading(true);
        try {
            const response = await axios.post("/api/gemini", userPrompt);
            setData(JSON.parse(response.data));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }


    return(
        <>
            <ModalProvider>
                <ModalWrapper/>
                <GameHeader/>
                    {userAuthLoad ? (
                        <LoadingSpinner />
                    ) : (
                <div className="flex flex-col flex-grow items-center justify-center">
                    <h2>Consensus Suggestion Manager</h2>
                    <p>Accept or Reject Consensus suggestions from users, or generate your own using ai.</p>
                    <ConsensiManager aiSuggestions={data} userSuggestion={userSuggestions}></ConsensiManager>
                    {loading &&
                        <div className="flex justify-center mt-4"><Loader2 className="animate-spin text-white h-8 w-8"/>
                        </div>}
                    <p className="m-5">Enter a category in the box below to generate new consensus options.</p>
                    <textarea placeholder="Enter your desired category"
                           onChange={e => setUserPrompt(e.target.value)}
                           className="border border-white text-white bg-transparent m-2 rounded-md">
                    </textarea>
                    <Button onClick={sendPrompt}>Generate</Button>
                </div>
                        )}

            </ModalProvider>
        </>
    );
}
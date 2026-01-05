import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle } from "lucide-react";
import { getContacts, respondToContact } from "@/lib/api";
import type { ContactMessage, ContactPagination } from "@/lib/types";

type ContactStatusFilter = "ALL" | "PENDING" | "RESPONDED" | "CLOSED";

const statusOptions: { label: string; value: ContactStatusFilter }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Responded", value: "RESPONDED" },
  { label: "Closed", value: "CLOSED" },
  { label: "All", value: "ALL" }
];

const ContactInboxSection = () => {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<ContactPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ContactStatusFilter>("PENDING");
  const [dialogContact, setDialogContact] = useState<ContactMessage | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusBadge = useMemo(() => {
    return filter === "ALL" ? "All inquiries" : `${filter.toLowerCase()} inquiries`;
  }, [filter]);

  const loadContacts = useCallback(
    async (status?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getContacts({
          status,
          limit: 6
        });
        setContacts(res?.data?.contacts ?? []);
        setPagination(res?.data?.pagination ?? null);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const status = filter === "ALL" ? undefined : filter;
    loadContacts(status);
  }, [filter, loadContacts]);

  const handleSendResponse = useCallback(async () => {
    if (!dialogContact || !responseText.trim()) return;
    setResponding(true);
    try {
      await respondToContact(dialogContact.id, responseText.trim());
      const status = filter === "ALL" ? undefined : filter;
      await loadContacts(status);
      setDialogContact(null);
      setResponseText("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to send response");
    } finally {
      setResponding(false);
    }
  }, [dialogContact, responseText, filter, loadContacts]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Contact Inquiries
            </CardTitle>
            <p className="text-sm text-gray-600">
              {statusBadge} &mdash; respond directly from the dashboard.
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {pagination?.total ?? 0} total
            </Badge>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as ContactStatusFilter)}>
              <TabsList className="bg-transparent p-0 gap-1">
                {statusOptions.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className="px-3 py-1 text-xs font-semibold rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading contact inquiries...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No contacts for this status.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="max-w-xs">Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{contact.name}</span>
                      <span className="text-xs text-gray-500">{contact.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{contact.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {contact.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <p>{contact.message.length > 90 ? `${contact.message.slice(0, 90)}...` : contact.message}</p>
                    {contact.response && (
                      <p className="text-xs text-green-600 mt-1">
                        Replied: {new Date(contact.respondedAt ?? "").toLocaleString()}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => {
                        setDialogContact(contact);
                        setResponseText(contact.response ?? "");
                      }}
                    >
                      Respond
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Dialog
        open={Boolean(dialogContact)}
        onOpenChange={(open) => {
          if (!open) {
            setDialogContact(null);
            setResponseText("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to {dialogContact?.name ?? "contact"}</DialogTitle>
            <DialogDescription>
              Your reply will be emailed directly to the person who submitted the form.
            </DialogDescription>
          </DialogHeader>
          {dialogContact && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-sm font-semibold text-gray-700">Subject</h4>
                <p className="text-sm text-gray-800">{dialogContact.subject}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h4 className="text-sm font-semibold text-gray-700">Message</h4>
                <p className="text-sm text-gray-800">{dialogContact.message}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Your Response</label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                  placeholder="Type your reply here..."
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="text-xs text-gray-500">
                  Response will be sent to {dialogContact.email}.
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleSendResponse} disabled={responding || !responseText.trim()}>
                    {responding ? "Sending..." : "Send Response"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogContact(null);
                      setResponseText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ContactInboxSection;


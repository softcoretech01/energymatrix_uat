import React, { useState, useEffect } from "react";
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription 
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
    History, 
    User, 
    Clock, 
    ChevronDown, 
    ChevronUp,
    FileText,
    PlusCircle,
    Edit,
    Trash2,
    CheckCircle
} from "lucide-react";
import api from "@/services/api";
import { format } from "date-fns";

interface AuditLog {
    id: number;
    user_id: number;
    user_name: string;
    action_type: string;
    module_name: string;
    entity_id: number;
    details: any;
    created_at: string;
}

interface HistoryTimelineProps {
    isOpen: boolean;
    onClose: () => void;
    moduleName: string;
    entityId: number | null;
    title?: string;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ 
    isOpen, 
    onClose, 
    moduleName, 
    entityId,
    title = "Transaction History"
}) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedLog, setExpandedLog] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && entityId) {
            fetchLogs();
        }
    }, [isOpen, entityId]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/audit/?module_name=${moduleName}&entity_id=${entityId}`);
            setLogs(res.data);
        } catch (err) {
            console.error("Failed to fetch history logs", err);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action.toUpperCase()) {
            case "SAVE":
            case "CREATE": return <PlusCircle className="h-4 w-4 text-emerald-500" />;
            case "UPDATE": return <Edit className="h-4 w-4 text-blue-500" />;
            case "DELETE": return <Trash2 className="h-4 w-4 text-rose-500" />;
            case "POST": return <CheckCircle className="h-4 w-4 text-indigo-500" />;
            default: return <FileText className="h-4 w-4 text-slate-500" />;
        }
    };

    const getActionBadge = (action: string) => {
        switch (action.toUpperCase()) {
            case "SAVE":
            case "CREATE": return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 capitalize">{action.toLowerCase()}</Badge>;
            case "UPDATE": return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 capitalize">{action.toLowerCase()}</Badge>;
            case "DELETE": return <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 capitalize">{action.toLowerCase()}</Badge>;
            case "POST": return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50 capitalize">{action.toLowerCase()}</Badge>;
            default: return <Badge variant="outline" className="capitalize">{action.toLowerCase()}</Badge>;
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-md p-0 overflow-hidden flex flex-col">
                <div className="p-6 border-b bg-slate-50/50">
                    <SheetHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <History className="h-5 w-5 text-indigo-600" />
                            </div>
                            <SheetTitle className="text-xl font-bold text-slate-800">{title}</SheetTitle>
                        </div>
                        <SheetDescription>
                            Timeline of all actions performed on this record.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <ScrollArea className="flex-1 p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="text-sm text-slate-500 font-medium">Loading history...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-center px-4">
                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <History className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-1">No History Yet</h3>
                            <p className="text-sm text-slate-500">
                                This record hasn't been audited or no actions have been logged yet.
                            </p>
                        </div>
                    ) : (
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {logs.map((log, index) => (
                                <div key={log.id} className="relative flex items-start group">
                                    {/* Icon Circle */}
                                    <div className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-slate-100 shadow-sm z-10 group-hover:border-indigo-200 transition-colors">
                                        {getActionIcon(log.action_type)}
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 ml-14">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {getActionBadge(log.action_type)}
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                                             onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User className="h-3 w-3 text-slate-600" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {log.user_name || "Unknown User"}
                                                    </span>
                                                </div>
                                                {log.details && (
                                                    <div className="text-slate-400">
                                                        {expandedLog === log.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Expandable Details */}
                                            {expandedLog === log.id && log.details && (
                                                <div className="mt-3 pt-3 border-t border-slate-50">
                                                    <pre className="text-[11px] leading-relaxed bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto font-mono max-h-40">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                
                <div className="p-4 border-t bg-slate-50 text-center text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                    Audit Log v1.0 • Secure Matrix
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default HistoryTimeline;

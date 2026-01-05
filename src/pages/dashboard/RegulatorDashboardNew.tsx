import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getRegulatorDashboard, getRegulatorProfile, getPendingReviews, updateReviewStatus } from "@/lib/api";
import type { User, PendingReview, RegulatorDashboardStats } from "@/lib/types";
import { DashboardStatGrid } from "@/components/dashboard/DashboardStatGrid";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";

const RegulatorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RegulatorDashboardStats | null>(null);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        // Load user profile
        const profileRes = await getRegulatorProfile();
        setProfile(profileRes.data);

        // Load regulator dashboard data
        const statsRes = await getRegulatorDashboard();
        setStats(statsRes.data.stats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const dashboardStats = [
    {
      label: "Total Cooperatives",
      value: stats?.totalCooperatives ?? '-',
      color: "blue" as const,
      description: "Registered",
      icon: Building2
    },
    {
      label: "Pending Approvals",
      value: stats?.pendingApprovals ?? '-',
      color: "orange" as const,
      description: "Awaiting review",
      icon: AlertTriangle
    },
    {
      label: "Compliance Issues",
      value: stats?.activeCompliance ?? '-',
      color: "green" as const,
      description: "Need attention",
      icon: FileText
    },
    {
      label: "Reports Reviewed",
      value: stats?.totalReports ?? '-',
      color: "purple" as const,
      description: "All time",
      icon: CheckCircle
    }
  ];

  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await getPendingReviews();
        setReviews(res.data.reviews);
      } catch (err: any) {
        setReviewsError(err.message);
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, []);

  const handleReviewAction = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateReviewStatus(reviewId, status);
      // Refresh reviews after update
      const res = await getPendingReviews();
      setReviews(res.data.reviews);
    } catch (err: any) {
      setReviewsError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          RCA Regulatory Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {profile?.firstName}! Monitor and regulate cooperative activities across Rwanda
        </p>
      </div>

      {/* Stats Grid */}
      {error ? (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-red-500 text-center">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <DashboardStatGrid loading={loading}>
          {!loading && dashboardStats.map((stat, index) => (
            <DashboardStatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
            />
          ))}
        </DashboardStatGrid>
      )}

      {/* Pending Reviews */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Pending Reviews
            {!reviewsLoading && !reviewsError && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({reviews.length})
              </span>
            )}
          </h3>
          <div className="space-y-4">
            {reviewsLoading ? (
              // Loading skeleton
              [...Array(2)].map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="animate-pulse">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <div className="h-9 bg-gray-200 rounded flex-1"></div>
                      <div className="h-9 bg-gray-200 rounded flex-1"></div>
                      <div className="h-9 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : reviewsError ? (
              <div className="text-center p-4">
                <p className="text-red-500 mb-2">Failed to load reviews</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No pending reviews at the moment
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-bold text-gray-900">{review.cooperativeName}</h4>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          review.priority === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : review.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {review.priority.charAt(0) + review.priority.slice(1).toLowerCase()} Priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Type: {review.type.replace('_', ' ').toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(review.submittedAt).toLocaleDateString()}
                      </p>
                      {review.description && (
                        <p className="text-sm text-gray-600 mt-2">{review.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={() => navigate(`/regulator-approvals/${review.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    <Button
                      className="flex-1 bg-[#b7eb34] hover:bg-[#b7eb34] text-white"
                      onClick={() => handleReviewAction(review.id, 'APPROVED')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      onClick={() => handleReviewAction(review.id, 'REJECTED')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegulatorDashboard;

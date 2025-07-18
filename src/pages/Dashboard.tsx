
import { DashboardStats } from "@/components/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/asset";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

const Dashboard = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { canManageAssets, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading) {
      fetchAssets();
    }
  }, [roleLoading, canManageAssets]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      console.log('Fetching assets for dashboard...');
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assets:', error);
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van de assets.",
          variant: "destructive",
        });
        return;
      }

      console.log('Assets fetched successfully:', data?.length || 0, 'items');

      // Transform database response to match Asset interface
      const transformedAssets: Asset[] = (data || []).map(dbAsset => ({
        id: dbAsset.id,
        type: dbAsset.type,
        brand: dbAsset.brand || '',
        model: dbAsset.model || '',
        serialNumber: dbAsset.serial_number || '',
        assetTag: dbAsset.asset_tag || '',
        status: dbAsset.status as Asset['status'],
        location: dbAsset.location || '',
        assignedTo: dbAsset.assigned_to || '',
        assignedToLocation: dbAsset.assigned_to_location || '',
        purchaseDate: dbAsset.purchase_date || '',
        warrantyExpiry: dbAsset.warranty_expiry || '',
        purchasePrice: dbAsset.purchase_price || 0,
        penaltyAmount: dbAsset.penalty_amount || 0,
        category: dbAsset.category as Asset['category'],
        image: dbAsset.image_url || '',
        comments: dbAsset.comments || '',
        reservable: dbAsset.reservable !== undefined ? dbAsset.reservable : true,
      }));

      // Filter assets based on user role and role categories (same logic as useAssetManagement)
      let finalAssets = transformedAssets;
      
      if (canManageAssets) {
        // Get user's role categories to filter assets
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileData?.role) {
            // Get role ID for the user's role
            const { data: roleData } = await supabase
              .from('roles')
              .select('id')
              .eq('name', profileData.role)
              .single();

            if (roleData) {
              // Get allowed categories for this role
              const { data: categoriesData } = await supabase
                .from('role_categories')
                .select('category')
                .eq('role_id', roleData.id);

              // If role has specific categories, filter assets by those categories
              if (categoriesData && categoriesData.length > 0) {
                const allowedCategories = categoriesData.map(c => c.category);
                finalAssets = transformedAssets.filter(asset => 
                  allowedCategories.includes(asset.category)
                );
              }
              // If no specific categories are set, show all assets (for Superadmin or roles without category restrictions)
            }
          }
        }
      } else {
        // Regular users only see reservable assets
        finalAssets = transformedAssets.filter(asset => asset.reservable === true);
      }

      setAssets(finalAssets);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Fout bij laden",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Overzicht van alle asset management activiteiten</p>
        </div>

        <div className="mb-6 sm:mb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <DashboardStats assets={assets} />
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <div className="w-full">
            <RecentActivity />
          </div>
          <div className="w-full">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
